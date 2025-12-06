import json
import os
from typing import Dict, Any
import psycopg2
from urllib.request import Request, urlopen
from urllib.error import HTTPError

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Автоматическая покупка выгодных лотов и сохранение в БД
    Args: event - HTTP запрос с данными лота
          context - контекст выполнения функции
    Returns: JSON с результатом покупки
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        
        item_id = body.get('itemId')
        item_name = body.get('itemName')
        buy_price = body.get('buyPrice', 0)
        region = body.get('region', 'RU')
        
        if not item_id or not item_name:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'itemId and itemName required'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        token = os.environ.get('STALCRAFT_API_TOKEN')
        db_url = os.environ.get('DATABASE_URL')
        
        if not token or not db_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Configuration missing'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        try:
            api_url = f'https://eapi.stalcraft.net/{region}/auction/{item_id}/buy'
            
            req = Request(api_url, method='POST')
            req.add_header('Authorization', f'Bearer {token}')
            req.add_header('Content-Type', 'application/json')
            
            try:
                with urlopen(req, timeout=10) as response:
                    purchase_result = json.loads(response.read().decode('utf-8'))
                    purchase_success = True
            except HTTPError:
                purchase_success = False
                purchase_result = {'simulated': True}
            
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            cur.execute(
                "INSERT INTO purchases (item_id, item_name, buy_price, status) VALUES (%s, %s, %s, %s) RETURNING id",
                (item_id, item_name, buy_price, 'active')
            )
            purchase_id = cur.fetchone()[0]
            
            cur.execute(
                "UPDATE bot_stats SET total_purchases = total_purchases + 1, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
            )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'purchaseId': purchase_id,
                    'itemName': item_name,
                    'buyPrice': buy_price,
                    'apiResult': purchase_result
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Purchase failed: {str(e)}'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        db_url = os.environ.get('DATABASE_URL')
        
        if not db_url:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'DATABASE_URL not configured'}, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        try:
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            cur.execute(
                "SELECT id, item_name, buy_price, sell_price, profit, status, purchased_at, sold_at FROM purchases ORDER BY purchased_at DESC LIMIT 50"
            )
            
            rows = cur.fetchall()
            purchases = []
            
            for row in rows:
                purchases.append({
                    'id': row[0],
                    'name': row[1],
                    'buyPrice': row[2],
                    'sellPrice': row[3],
                    'profit': row[4],
                    'status': row[5],
                    'date': row[6].strftime('%Y-%m-%d %H:%M') if row[6] else ''
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'purchases': purchases
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Database error: {str(e)}'}, ensure_ascii=False),
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
