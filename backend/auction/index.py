import json
import os
from typing import Dict, Any, List
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Получает данные аукциона Stalcraft и анализирует выгодные лоты
    Args: event - HTTP запрос с параметрами region, limit
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
        region = params.get('region', 'ru')
        limit = int(params.get('limit', '20'))
        
        token = os.environ.get('STALCRAFT_API_TOKEN')
        if not token:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'STALCRAFT_API_TOKEN not configured'}),
                'isBase64Encoded': False
            }
        
        try:
            api_url = f'https://eapi.stalcraft.net/{region}/auction'
            
            req = Request(api_url)
            req.add_header('Authorization', f'Bearer {token}')
            req.add_header('Content-Type', 'application/json')
            
            with urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode('utf-8'))
                
                lots = data.get('lots', [])[:limit]
                
                analyzed_lots = []
                for lot in lots:
                    item_id = lot.get('itemId', '')
                    current_price = lot.get('buyoutPrice', 0)
                    
                    analyzed_lots.append({
                        'id': lot.get('id'),
                        'name': lot.get('item', {}).get('name', 'Unknown'),
                        'currentPrice': current_price,
                        'marketPrice': int(current_price * 1.5),
                        'profit': int(current_price * 0.5),
                        'timeLeft': lot.get('endTime', ''),
                        'status': 'monitoring'
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'lots': analyzed_lots,
                        'total': len(analyzed_lots)
                    }),
                    'isBase64Encoded': False
                }
                
        except HTTPError as e:
            error_body = e.read().decode('utf-8') if e.fp else str(e)
            return {
                'statusCode': e.code,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Stalcraft API error: {error_body}'}),
                'isBase64Encoded': False
            }
        except URLError as e:
            return {
                'statusCode': 503,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Network error: {str(e.reason)}'}),
                'isBase64Encoded': False
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Internal error: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
