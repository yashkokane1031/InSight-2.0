import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# List of potential model names to try (with models/ prefix)
candidates = [
    'models/gemini-1.5-flash',
    'models/gemini-1.5-flash-001',
    'models/gemini-1.5-flash-002',
    'models/gemini-1.5-flash-latest',
    'models/gemini-pro',
    'models/gemini-1.0-pro',
    'models/gemini-pro-latest',
    'models/gemini-flash-latest'
]

print('--- STARTING CONNECTIVITY TEST ---')
print('Testing models with actual API calls...\n')

for name in candidates:
    try:
        print(f'Testing {name}...', end=' ')
        model = genai.GenerativeModel(name)
        response = model.generate_content('Say hello')
        print(f'✅ SUCCESS!')
        print(f'\n🎯 WORKING MODEL FOUND: {name}')
        print(f'Response: {response.text[:50]}...')
        break
    except Exception as e:
        error_msg = str(e)
        if '404' in error_msg:
            print(f'❌ Not found (404)')
        elif 'quota' in error_msg.lower() or 'resource' in error_msg.lower():
            print(f'⚠️  No quota available')
        else:
            print(f'❌ Error: {error_msg[:60]}...')

print('\n--- TEST COMPLETE ---')
