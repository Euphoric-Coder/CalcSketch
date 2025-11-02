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

    # Parse response
    answers = []
    try:
        answers = ast.literal_eval(response.text)
    except Exception as e:
        print(f"⚠️ Error parsing response: {e}")
        answers = []

    # Add default 'assign' field for consistency
    for ans in answers:
        ans["assign"] = bool(ans.get("assign", False))

    print("Final answers:", answers)
    return answers
