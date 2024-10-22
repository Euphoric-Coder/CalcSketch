import google.generativeai as genai
import ast
import json
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def analyze_image(img: Image, dict_of_vars: dict):
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You have been provided an image with various mathematical expressions, equations, graphical problems, or abstract concepts. "
        f"Your task is to analyze and solve them. Follow the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). "
        f"Here are the types of problems you might encounter in the image and how you should respond to each: \n\n"
        f"**Mathematical Expressions and Equations:**\n"
        f"1. **Simple Mathematical Expressions:** These could be arithmetic problems such as 2 + 2, 3 * 4, 7 - 8, etc. Solve the expression and return the answer in the format of a **list of one dictionary**, as follows:\n"
        f"[{{'expr': '2 + 2', 'result': 4}}].\n\n"
        f"2. **Set of Equations:** These might include problems like x^2 + 2x + 1 = 0 or 3y + 4x = 0. Solve for the unknown variables and return the result in a **comma-separated list of dictionaries**. For example, if x = 2 and y = 5, the response should be:\n"
        f"[{{'expr': 'x', 'result': 2, 'assign': True}}, {{'expr': 'y', 'result': 5, 'assign': True}}]. Include as many dictionaries as there are variables in the problem.\n\n"
        f"3. **Assigning Values to Variables:** For problems like x = 4, y = 5, return a list of dictionaries where each variable is assigned its value. Example response:\n"
        f"[{{'expr': 'x', 'result': 4, 'assign': True}}, {{'expr': 'y', 'result': 5, 'assign': True}}].\n\n"
        f"**Graphical Math Problems:**\n"
        f"4. **Word Problems Represented Graphically:** These problems might involve scenarios like cars colliding, trigonometric problems, or geometric shapes with labeled sides or angles (e.g., Pythagorean theorem). Pay special attention to colors or labels used in the image. Return the answer in the format of a **list of one dictionary**. Example:\n"
        f"[{{'expr': 'Pythagorean theorem', 'result': 10}}].\n\n"
        f"**Detecting Abstract Concepts in Drawings:**\n"
        f"5. **Abstract Concepts:** The image may contain abstract representations of emotions, ideas, historical references, or symbolic drawings (such as a heart for love, a flag for patriotism, etc.). Examples of abstract concepts might include: \n"
        f"- Emotions: Love, Hate, Jealousy, Compassion, Anger, Sadness\n"
        f"- Ideas: Freedom, Innovation, Equality, Democracy, Justice\n"
        f"- Historical references: War, Revolution, Discovery, Invention, Scientific Breakthroughs\n"
        f"- Cultural symbols: Religion, Festivals, Nationalism, Traditions\n"
        f"- Famous quotes or references: Literary works, Scientific theories, Philosophy\n"
        f"For these, return the result in the format:\n"
        f"[{{'expr': 'Patriotism', 'result': 'A flag representing national pride'}}].\n\n"
        f"Use the following dictionary of user-assigned variables if any are present in the expression or equation: {dict_of_vars_str}. "
        f"Make sure all dictionary keys and values are properly quoted for easier parsing with Python's `ast.literal_eval`. "
        f"DO NOT use backticks or markdown formatting in the response."
    )
    response = model.generate_content([prompt, img])
    print(response.text)
    answers = []
    try:
        answers = ast.literal_eval(response.text)
    except Exception as e:
        print(f"Error in parsing response from Gemini API: {e}")
    print('returned answer ', answers)
    for answer in answers:
        if 'assign' in answer:
            answer['assign'] = True
        else:
            answer['assign'] = False
    return answers
