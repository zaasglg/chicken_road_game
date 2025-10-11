#!/usr/bin/env python3
"""
Тестирование API для игры Chicken Road
"""

import requests
import json
import sys

# Конфигурация
API_BASE_URL = "http://api.valor-games.co"
ACCESS_TOKEN = "your_access_token_here"  # Замените на реальный токен

def test_deposit_api():
    """Тестирует API для депозита"""
    
    url = f"{API_BASE_URL}/api/user/deposit/"
    
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Тестовые данные
    test_cases = [
        {
            "name": "Выигрыш",
            "data": {
                "deposit": "150.50",
                "game_result": "win",
                "bet_amount": 10.0,
                "win_amount": 150.50,
                "final_balance": 1000.50,
                "user_id": 12345
            }
        },
        {
            "name": "Проигрыш",
            "data": {
                "deposit": "-10.00",
                "game_result": "loss",
                "bet_amount": 10.0,
                "win_amount": 0.0,
                "final_balance": 990.00,
                "user_id": 12345
            }
        },
        {
            "name": "Большой выигрыш",
            "data": {
                "deposit": "5000.00",
                "game_result": "win",
                "bet_amount": 100.0,
                "win_amount": 5000.00,
                "final_balance": 15000.00,
                "user_id": 12345
            }
        }
    ]
    
    print("🚀 Тестирование API Chicken Road")
    print("=" * 50)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Тест {i}: {test_case['name']}")
        print(f"URL: {url}")
        print(f"Данные: {json.dumps(test_case['data'], indent=2)}")
        
        try:
            response = requests.put(url, headers=headers, json=test_case['data'])
            
            print(f"Статус: {response.status_code}")
            
            if response.status_code == 200:
                print("✅ Успешно!")
                try:
                    response_data = response.json()
                    print(f"Ответ: {json.dumps(response_data, indent=2)}")
                except:
                    print(f"Ответ: {response.text}")
            else:
                print("❌ Ошибка!")
                print(f"Ответ: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка соединения: {e}")
        
        print("-" * 30)

def test_with_curl():
    """Показывает примеры curl команд"""
    
    print("\n🔧 Примеры curl команд:")
    print("=" * 50)
    
    curl_examples = [
        {
            "name": "Выигрыш",
            "command": f'''curl -X PUT "{API_BASE_URL}/api/user/deposit/" \\
  -H "Authorization: Bearer {ACCESS_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{{"deposit": "150.50", "game_result": "win", "bet_amount": 10.0, "win_amount": 150.50, "final_balance": 1000.50, "user_id": 12345}}'
'''
        },
        {
            "name": "Проигрыш",
            "command": f'''curl -X PUT "{API_BASE_URL}/api/user/deposit/" \\
  -H "Authorization: Bearer {ACCESS_TOKEN}" \\
  -H "Content-Type: application/json" \\
  -d '{{"deposit": "-10.00", "game_result": "loss", "bet_amount": 10.0, "win_amount": 0.0, "final_balance": 990.00, "user_id": 12345}}'
'''
        }
    ]
    
    for i, example in enumerate(curl_examples, 1):
        print(f"\n📋 Пример {i}: {example['name']}")
        print(example['command'])

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--curl":
        test_with_curl()
    else:
        test_deposit_api()
        test_with_curl()
    
    print("\n💡 Для показа только curl примеров используйте: python test_deposit_api.py --curl")
