from typing import Literal, List, Any, Dict
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field, field_validator
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain_community.utilities import SQLDatabase

load_dotenv()


class QueryClassifierPydanticType(BaseModel):
    value: Literal["SEARCH", "VISUALIZE"] = Field(
        description="The option to either SEARCH or VISUALIZE"
    )


class UserType(BaseModel):
    user_id: str = Field(description="The User's ID represented as a UUID")
    name: str = Field(description="Name of the user")
    dob: str = Field(description="Date of birth of the user")
    email: str = Field(description="Email of the user")


class UserPydanticType(BaseModel):
    message: str = Field(
        description="The description of the given item(s) in one sentence"
    )
    query: str = Field(description="Query used for the information gathering")
    content: List[Dict[str, Any]] = Field(
        description="List of all the queried items as dictionaries"
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, v):
        """Ensure content is a list of dictionaries"""
        if not isinstance(v, list):
            raise ValueError("content must be a list")
        for item in v:
            if not isinstance(item, dict):
                raise ValueError("Each item in content must be a dictionary")
        return v


class ChartDataPoint(BaseModel):
    """Represents a single data point in the chart"""

    data: Dict[str, Any] = Field(
        description="Dictionary containing the data for this point (e.g., {name: 'Jan', value: 100})"
    )


class VisualizerPydanticType(BaseModel):
    """
    Structure for chart/graph data compatible with shadcn/recharts.
    Supports various chart types: line, bar, area, pie, radar, etc.
    """

    query: str = Field(description="The SQL query used for the result")
    chart_type: Literal[
        "line", "bar", "area", "pie", "donut", "radar", "radial", "composed"
    ] = Field(
        description="Type of chart to render (line, bar, area, pie, donut, radar, radial, composed)"
    )
    title: str = Field(description="Title for the chart")
    description: str = Field(description="Brief description of what the chart shows")
    data: List[Dict[str, Any]] = Field(
        description="Array of data points where each object contains key-value pairs for the chart axes/dimensions"
    )
    x_axis_key: str = Field(
        description="The key name in data objects to use for x-axis (e.g., 'month', 'category', 'name')"
    )
    y_axis_keys: List[str] = Field(
        description="List of key names in data objects to use for y-axis values (e.g., ['sales', 'revenue'])"
    )
    colors: List[str] = Field(
        default=["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1"],
        description="Array of color codes for the chart lines/bars",
    )
    show_legend: bool = Field(default=True, description="Whether to show the legend")
    show_grid: bool = Field(default=True, description="Whether to show grid lines")

    @field_validator("data")
    @classmethod
    def validate_data(cls, v):
        """Ensure data is a list of dictionaries (can be empty if no data available)"""
        if not isinstance(v, list):
            raise ValueError("data must be a list")
        for item in v:
            if not isinstance(item, dict):
                raise ValueError("Each item in data must be a dictionary")
        return v


llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")


def query_classifier(query: str):
    query_classifier_prompt = """You are a helpful assistant for an inventory management system called ''InventraX'.
    An input will be given in which the user will describe the data they want to access and in which way to access it.
    You are responsible to give the classification on whether the user wants to search data or visualize it. 
    Classify and respond in either of these two responses SEARCH or VISUALIZE according to the query.
    Format Instructions: {format_instructions}
    Here is the question: {question}
        """

    query_classifier_parser = PydanticOutputParser(
        pydantic_object=QueryClassifierPydanticType
    )
    query_classifier_template = PromptTemplate(
        template=query_classifier_prompt,
        input_variables=["question"],
        partial_variables={
            "format_instructions": query_classifier_parser.get_format_instructions()
        },
    )

    query_classifier_chain = query_classifier_template | llm | query_classifier_parser
    query_classification_ans = query_classifier_chain.invoke({"question": query})

    if query_classification_ans.value == "VISUALIZE":
        return visualize(query)
    elif query_classification_ans.value == "SEARCH":
        return select(query)


def select(query: str):
    """
    Execute SQL query using SQL agent and structure the output into UserPydanticType format.

    Returns:
        UserPydanticType: Structured query result with message, query, and content
    """
    try:
        # Step 1: Use SQL agent to get the raw data from database
        db = SQLDatabase.from_uri(
            "postgresql+psycopg://postgres:bigsparsh@localhost:5432/inventorydb"
        )
        toolkit = SQLDatabaseToolkit(db=db, llm=llm)
        agent_executor = create_sql_agent(
            llm=llm,
            toolkit=toolkit,
            verbose=True,
            agent_type="openai-tools",
            handle_parsing_errors=True,
        )

        # Get the raw output from SQL agent
        sql_agent_result = agent_executor.invoke({"input": query})
        raw_output = sql_agent_result["output"]
        print("\n=== SQL Agent Raw Output ===")
        print(raw_output)

    except Exception as e:
        print("\n=== SQL Agent Error ===")
        print(f"Error executing SQL agent: {e}")
        raise

    # Step 2: Use LLM to structure the raw output into the required format
    select_parser = PydanticOutputParser(pydantic_object=UserPydanticType)
    structure_prompt = PromptTemplate(
        template=(
            "You are a data formatter. Convert the following SQL query result into structured JSON format.\n"
            "Do not include any markdown code blocks or backticks, just return the JSON.\n"
            "The 'content' field must be a list of dictionaries, where each dictionary represents one row.\n\n"
            "Original query: {original_query}\n\n"
            "SQL result: {sql_result}\n\n"
            "{format_instructions}"
        ),
        input_variables=["original_query", "sql_result"],
        partial_variables={
            "format_instructions": select_parser.get_format_instructions()
        },
    )

    structure_chain = structure_prompt | llm | select_parser

    try:
        structured_result = structure_chain.invoke(
            {"original_query": query, "sql_result": raw_output}
        )
        print("\n=== Structured Result ===")
        print(structured_result)
        return structured_result

    except Exception as e:
        print("\n=== Parsing Error ===")
        print(f"Error: {e}")
        print("\nAttempting to parse manually...")

        try:
            # Fallback: try to extract JSON from the LLM response
            llm_response = (structure_prompt | llm).invoke(
                {"original_query": query, "sql_result": raw_output}
            )
            print(f"LLM Response: {llm_response.content}")

            # Try to parse after cleaning markdown
            cleaned_output = llm_response.content.strip()
            if cleaned_output.startswith("```json"):
                cleaned_output = cleaned_output[7:]
            if cleaned_output.startswith("```"):
                cleaned_output = cleaned_output[3:]
            if cleaned_output.endswith("```"):
                cleaned_output = cleaned_output[:-3]
            cleaned_output = cleaned_output.strip()

            print(f"\nCleaned output: {cleaned_output}")
            structured_result = select_parser.parse(cleaned_output)
            print("\n=== Structured Result (after cleanup) ===")
            print(structured_result)
            return structured_result

        except Exception as fallback_error:
            print("\n=== Fallback Parsing Error ===")
            print(f"Error: {fallback_error}")
            raise


def visualize(query: str):
    """
    Execute SQL query using SQL agent and structure the output for chart visualization.
    Returns data formatted for shadcn/recharts components.

    Args:
        query: Natural language query describing what to visualize

    Returns:
        VisualizerPydanticType: Structured chart data with type, data points, and configuration
    """
    try:
        # Step 1: Use SQL agent to get the raw data from database
        db = SQLDatabase.from_uri(
            "postgresql+psycopg://postgres:bigsparsh@localhost:5432/inventorydb"
        )
        toolkit = SQLDatabaseToolkit(db=db, llm=llm)
        agent_executor = create_sql_agent(
            llm=llm,
            toolkit=toolkit,
            verbose=True,
            agent_type="openai-tools",
            handle_parsing_errors=True,
            return_intermediate_steps=True,  # Enable intermediate steps to capture SQL
        )

        # Get the raw output from SQL agent with emphasis on aggregated/visualization data
        enhanced_query = f"{
            query
        }. Provide data suitable for visualization with aggregated or grouped results."
        sql_agent_result = agent_executor.invoke({"input": enhanced_query})
        raw_output = sql_agent_result["output"]

        # Extract the actual SQL query from intermediate steps
        sql_query = None
        if "intermediate_steps" in sql_agent_result:
            for step in sql_agent_result["intermediate_steps"]:
                # Look for the sql_db_query tool invocation
                if len(step) >= 2:
                    action, observation = step[0], step[1]
                    if hasattr(action, "tool") and action.tool == "sql_db_query":
                        if hasattr(action, "tool_input"):
                            if (
                                isinstance(action.tool_input, dict)
                                and "query" in action.tool_input
                            ):
                                sql_query = action.tool_input["query"]
                                break

        print("\n=== SQL Agent Raw Output (Visualize) ===")
        print(raw_output)
        if sql_query:
            print("\n=== Extracted SQL Query ===")
            print(sql_query)

    except Exception as e:
        print("\n=== SQL Agent Error (Visualize) ===")
        print(f"Error executing SQL agent: {e}")
        raise

    # Step 2: Use LLM to structure the raw output into chart-ready format
    visualize_parser = PydanticOutputParser(pydantic_object=VisualizerPydanticType)
    structure_prompt = PromptTemplate(
        template=(
            "You are a data visualization expert. Convert the following SQL query result into a chart-ready JSON format.\n"
            "Analyze the data and determine the most appropriate chart type (line, bar, area, pie, donut, radar, radial, composed).\n"
            "Structure the data so it can be directly used by shadcn/recharts components.\n"
            "Do not include any markdown code blocks or backticks, just return the JSON.\n\n"
            "Guidelines:\n"
            "- For the 'query' field, use the provided SQL query exactly as given\n"
            "- For time series data, use 'line' or 'area' charts\n"
            "- For categorical comparisons, use 'bar' charts\n"
            "- For proportions/percentages, use 'pie' or 'donut' charts\n"
            "- Each data point should be a dictionary with consistent keys\n"
            "- x_axis_key should be the categorical/time dimension\n"
            "- y_axis_keys should be the numeric values to plot\n"
            "- Provide meaningful title and description\n\n"
            "SQL Query used: {sql_query}\n\n"
            "Original query: {original_query}\n\n"
            "SQL result: {sql_result}\n\n"
            "{format_instructions}"
        ),
        input_variables=["original_query", "sql_result", "sql_query"],
        partial_variables={
            "format_instructions": visualize_parser.get_format_instructions()
        },
    )

    structure_chain = structure_prompt | llm | visualize_parser

    try:
        structured_result = structure_chain.invoke(
            {
                "original_query": query,
                "sql_result": raw_output,
                "sql_query": sql_query or "SQL query not captured",
            }
        )
        print("\n=== Structured Visualization Result ===")
        print(f"Chart Type: {structured_result.chart_type}")
        print(f"Query: {structured_result.query}")
        print(f"Title: {structured_result.title}")
        print(f"Description: {structured_result.description}")
        print(f"Data Points: {len(structured_result.data)}")
        print(f"X-Axis: {structured_result.x_axis_key}")
        print(f"Y-Axis: {structured_result.y_axis_keys}")
        print(
            f"Sample Data: {
                structured_result.data[:2] if len(structured_result.data) > 0 else []
            }"
        )
        return structured_result

    except Exception as e:
        print("\n=== Parsing Error (Visualize) ===")
        print(f"Error: {e}")
        print("\nAttempting to parse manually...")

        try:
            # Fallback: try to extract JSON from the LLM response
            llm_response = (structure_prompt | llm).invoke(
                {
                    "original_query": query,
                    "sql_result": raw_output,
                    "sql_query": sql_query or "SQL query not captured",
                }
            )
            print(f"LLM Response: {llm_response.content}")

            # Try to parse after cleaning markdown
            cleaned_output = llm_response.content.strip()
            if cleaned_output.startswith("```json"):
                cleaned_output = cleaned_output[7:]
            if cleaned_output.startswith("```"):
                cleaned_output = cleaned_output[3:]
            if cleaned_output.endswith("```"):
                cleaned_output = cleaned_output[:-3]
            cleaned_output = cleaned_output.strip()

            print(f"\nCleaned output: {cleaned_output}")
            structured_result = visualize_parser.parse(cleaned_output)
            print("\n=== Structured Visualization Result (after cleanup) ===")
            print(f"Chart Type: {structured_result.chart_type}")
            print(f"Title: {structured_result.title}")
            print(structured_result)
            return structured_result

        except Exception as fallback_error:
            print("\n=== Fallback Parsing Error (Visualize) ===")
            print(f"Error: {fallback_error}")
            raise


if __name__ == "__main__":
    # Test both functions
    print("=" * 80)
    print("Testing SELECT function:")
    print("=" * 80)
    result1 = query_classifier("List all the users")
    print(f"\nFinal Result Type: {type(result1)}")
    print(f"Final Result: {result1}")

    print("\n\n")
    print("=" * 80)
    print("Testing VISUALIZE function:")
    print("=" * 80)
    result2 = query_classifier("Show me the count of products by category")
    print(f"\nFinal Result Type: {type(result2)}")
    print(f"Final Result: {result2}")
