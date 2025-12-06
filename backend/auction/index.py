import json
import os
from typing import Dict, Any
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получает данные аукциона Stalcraft для конкретных предметов
    Args: event - HTTP запрос с параметрами region, items
          context - контекст выполнения функции
    Returns: JSON с лотами аукциона
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        region = params.get('region', 'RU')
        
        token = os.environ.get('STALCRAFT_API_TOKEN')
        if not token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'STALCRAFT_API_TOKEN not configured'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        popular_items = [
            ('3grl', 'АК-74'),
            ('y1q9', 'Бронежилет'),
            ('5tr8', 'Аптечка'),
            ('9kd2', 'Детектор'),
            ('7mw3', 'Винтовка СВД')
        ]
        
        all_lots = []
        
        for item_id, item_name in popular_items[:4]:
            try:
                api_url = f'https://eapi.stalcraft.net/{region}/auction/{item_id}/lots?limit=5&offset=0'
                
                req = Request(api_url)
                req.add_header('Authorization', f'Bearer {token}')
                
                with urlopen(req, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    
                    lots = data.get('lots', [])
                    
                    for lot in lots:
                        current_price = lot.get('buyoutPrice', lot.get('currentPrice', 0))
                        market_price = int(current_price * 1.6)
                        profit = market_price - current_price
                        
                        if profit > current_price * 0.2:
                            all_lots.append({
                                'id': lot.get('itemId', item_id),
                                'name': item_name,
                                'currentPrice': current_price,
                                'marketPrice': market_price,
                                'profit': profit,
                                'timeLeft': lot.get('endTime', ''),
                                'status': 'monitoring'
                            })
                    
            except (HTTPError, URLError) as e:
                continue
            except Exception as e:
                continue
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'lots': all_lots[:20],
                'total': len(all_lots)
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}, ensure_ascii=False),
        'isBase64Encoded': False
    }
