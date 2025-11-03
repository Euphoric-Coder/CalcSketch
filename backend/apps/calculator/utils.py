import ast
import json
from io import BytesIO
from PIL import Image
import google.generativeai as genai
from constants import GEMINI_API_KEY

# Configure API key
genai.configure(api_key=GEMINI_API_KEY)


def analyze_image(img: Image.Image, dict_of_vars: dict):
    """
    Analyze a mathematical/graphical/abstract problem from an image
    using Google's Gemini multimodal API.
    """

    # Use the latest available model
    model_name = "gemini-2.0-flash"  # or gemini-2.0-pro if you need reasoning

    # Convert dictionary of vars to JSON
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)

    # Build your text prompt
    prompt = (
        "You are an AI that analyzes an image containing mathematical expressions, "
        "equations, graphs, or abstract drawings. Follow these rules:\n\n"
        "• Apply PEMDAS for math expressions.\n"
        "• Return answers ONLY as a Python list of dictionaries.\n"
        "• Use keys: 'expr', 'result', and optional 'assign' (boolean).\n\n"
        "Examples:\n"
        "[{'expr': '2 + 2', 'result': 4}]\n"
        "[{'expr': 'x', 'result': 5, 'assign': True}]\n"
        "[{'expr': 'x', 'result': 3, 'assign': True}, {'expr': 'y', 'result': 6, 'assign': True}]\n\n"
        "For abstract art or symbols, describe concept meaningfully:\n"
        "[{'expr': 'Patriotism', 'result': 'A flag representing national pride'}]\n\n"
        f"Use these variable assignments if relevant: {dict_of_vars_str}.\n"
        "Do not use markdown or backticks — only raw list syntax."
    )

    # Convert PIL image to bytes
    img_buffer = BytesIO()
    img.save(img_buffer, format="PNG")
    img_bytes = img_buffer.getvalue()

    # Create model instance
    model = genai.GenerativeModel(model_name=model_name)

    # ✅ Modern multimodal call — pass text and image as list
    response = model.generate_content(
        [
            prompt,
            {
                "mime_type": "image/png",
                "data": img_bytes,
            },
        ]
    )

    print("Raw response:", response.text)

    answers = []

    try:
        # Step 1: Try direct parsing (literal_eval)
        text = response.text.strip()

        # Some models return JSON with single quotes or code blocks
        text = text.strip("`").replace("json", "").strip()

        # Fix single quotes -> double quotes for valid JSON parsing
        text_json_like = text.replace("'", '"')

        try:
            parsed = json.loads(text_json_like)
        except json.JSONDecodeError:
            # Fallback: attempt ast.literal_eval
            parsed = ast.literal_eval(text)

        # Step 2: Ensure parsed data is a list of dicts
        if isinstance(parsed, dict):
            parsed = [parsed]
        elif not isinstance(parsed, list):
            parsed = [{"expr": "Unknown", "result": str(parsed)}]

        # Step 3: Normalize all entries
        answers = []
        for item in parsed:
            expr = str(item.get("expr", ""))
            result = item.get("result", "")
            assign = bool(item.get("assign", False))

            # Convert any non-serializable or numeric result to string safely
            if isinstance(result, (int, float)):
                result_str = str(result)
            elif isinstance(result, (dict, list)):
                result_str = json.dumps(result, ensure_ascii=False)
            else:
                result_str = str(result)

            answers.append(
                {"expr": expr.strip(), "result": result_str.strip(), "assign": assign}
            )

    except Exception as e:
        print(f"⚠️ Error parsing response: {e}")
        answers = []

    print("Final answers:", answers)
    return answers
