import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const mockLots = [
  { id: 1, name: 'Винтовка AK-74', currentPrice: 15000, marketPrice: 25000, profit: 10000, status: 'monitoring' },
  { id: 2, name: 'Бронежилет 4 класса', currentPrice: 8000, marketPrice: 14000, profit: 6000, status: 'monitoring' },
  { id: 3, name: 'Аптечка военная', currentPrice: 1200, marketPrice: 2500, profit: 1300, status: 'monitoring' },
  { id: 4, name: 'Детектор артефактов', currentPrice: 35000, marketPrice: 50000, profit: 15000, status: 'monitoring' },
];

const mockPurchases = [
  { id: 1, name: 'АК-47 Модифицированный', buyPrice: 22000, sellPrice: 35000, profit: 13000, date: '2024-12-06 14:32', status: 'sold' },
  { id: 2, name: 'Экзоскелет', buyPrice: 45000, sellPrice: 62000, profit: 17000, date: '2024-12-06 13:15', status: 'sold' },
  { id: 3, name: 'Артефакт "Глаз"', buyPrice: 8000, sellPrice: 0, profit: 0, date: '2024-12-06 12:45', status: 'active' },
];

const mockActiveSales = [
  { id: 1, name: 'Автомат АК-47', price: 35000, listed: '2ч назад', views: 23, status: 'active' },
  { id: 2, name: 'Экзоскелет', price: 62000, listed: '3ч назад', views: 45, status: 'active' },
  { id: 3, name: 'Противогаз', price: 4500, listed: '5ч назад', views: 12, status: 'active' },
];

const API_URL = 'https://functions.poehali.dev/ec5230be-1140-4daa-bc28-61a5fc954f71';

export default function Index() {
  const [botActive, setBotActive] = useState(false);
  const [autoSell, setAutoSell] = useState(true);
  const [lots, setLots] = useState(mockLots);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?region=RU&limit=20`);
      const data = await response.json();
      
      if (data.success && data.lots.length > 0) {
        setLots(data.lots);
        toast({
          title: 'Данные обновлены',
          description: `Найдено ${data.total} выгодных лотов`,
        });
      } else {
        setLots(mockLots);
      }
    } catch (error) {
      console.error('Error fetching lots:', error);
      setLots(mockLots);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (botActive) {
      fetchLots();
      const interval = setInterval(fetchLots, 30000);
      return () => clearInterval(interval);
    }
  }, [botActive]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Icon name="TrendingUp" size={32} className="text-primary" />
              Stalcraft Trading Bot
            </h1>
            <p className="text-muted-foreground mt-1">Автоматическая торговля на аукционе</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
              <Icon name="Bot" size={20} className={botActive ? 'text-success' : 'text-muted-foreground'} />
              <span className="text-sm font-medium">Бот</span>
              <Switch checked={botActive} onCheckedChange={setBotActive} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Всего сделок</CardDescription>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Icon name="ShoppingCart" size={24} className="text-primary" />
                156
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Общая прибыль</CardDescription>
              <CardTitle className="text-3xl font-bold flex items-center gap-2 text-success">
                <Icon name="TrendingUp" size={24} />
                ₽847K
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Успешность</CardDescription>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Icon name="Target" size={24} className="text-secondary" />
                94%
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Активных продаж</CardDescription>
              <CardTitle className="text-3xl font-bold flex items-center gap-2">
                <Icon name="Tag" size={24} className="text-warning" />
                {mockActiveSales.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Eye" size={16} className="mr-2" />
              Мониторинг
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="Store" size={16} className="mr-2" />
              Продажи
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Search" size={20} />
                      Выгодные лоты
                    </CardTitle>
                    <CardDescription className="mt-1">Автоматический поиск прибыльных предложений</CardDescription>
                  </div>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={fetchLots}
                    disabled={loading}
                  >
                    <Icon name={loading ? "Loader2" : "RefreshCw"} size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Обновление...' : 'Обновить'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Предмет</TableHead>
                      <TableHead className="text-muted-foreground">Текущая цена</TableHead>
                      <TableHead className="text-muted-foreground">Рыночная цена</TableHead>
                      <TableHead className="text-muted-foreground">Прибыль</TableHead>
                      <TableHead className="text-muted-foreground text-right">Действие</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lots.map((lot) => (
                      <TableRow key={lot.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{lot.name}</TableCell>
                        <TableCell>₽{lot.currentPrice.toLocaleString()}</TableCell>
                        <TableCell>₽{lot.marketPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-success font-semibold">+₽{lot.profit.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" className="bg-primary hover:bg-primary/90">
                            <Icon name="ShoppingCart" size={14} className="mr-1" />
                            Купить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={20} />
                  История покупок
                </CardTitle>
                <CardDescription>Все совершённые сделки</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Предмет</TableHead>
                      <TableHead className="text-muted-foreground">Куплено</TableHead>
                      <TableHead className="text-muted-foreground">Продано</TableHead>
                      <TableHead className="text-muted-foreground">Прибыль</TableHead>
                      <TableHead className="text-muted-foreground">Дата</TableHead>
                      <TableHead className="text-muted-foreground">Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPurchases.map((purchase) => (
                      <TableRow key={purchase.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{purchase.name}</TableCell>
                        <TableCell>₽{purchase.buyPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          {purchase.sellPrice > 0 ? `₽${purchase.sellPrice.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell>
                          {purchase.profit > 0 ? (
                            <span className="text-success font-semibold">+₽{purchase.profit.toLocaleString()}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{purchase.date}</TableCell>
                        <TableCell>
                          <Badge variant={purchase.status === 'sold' ? 'default' : 'secondary'} className={purchase.status === 'sold' ? 'bg-success text-white' : ''}>
                            {purchase.status === 'sold' ? 'Продано' : 'На продаже'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Store" size={20} />
                      Активные продажи
                    </CardTitle>
                    <CardDescription className="mt-1">Предметы на аукционе</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Автопродажа</span>
                    <Switch checked={autoSell} onCheckedChange={setAutoSell} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Предмет</TableHead>
                      <TableHead className="text-muted-foreground">Цена</TableHead>
                      <TableHead className="text-muted-foreground">Выставлено</TableHead>
                      <TableHead className="text-muted-foreground">Просмотры</TableHead>
                      <TableHead className="text-muted-foreground text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockActiveSales.map((sale) => (
                      <TableRow key={sale.id} className="border-border hover:bg-muted/50">
                        <TableCell className="font-medium">{sale.name}</TableCell>
                        <TableCell className="font-semibold">₽{sale.price.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{sale.listed}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon name="Eye" size={14} className="text-muted-foreground" />
                            <span>{sale.views}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="border-border hover:bg-muted">
                            <Icon name="X" size={14} className="mr-1" />
                            Снять
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="TrendingUp" size={20} />
                    Прибыль по дням
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Понедельник</span>
                        <span className="font-semibold text-success">₽45K</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Вторник</span>
                        <span className="font-semibold text-success">₽62K</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Среда</span>
                        <span className="font-semibold text-success">₽38K</span>
                      </div>
                      <Progress value={61} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Четверг</span>
                        <span className="font-semibold text-success">₽51K</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Пятница</span>
                        <span className="font-semibold text-success">₽58K</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={20} />
                    Топ категории
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Оружие</span>
                        <span className="font-semibold">42%</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Броня</span>
                        <span className="font-semibold">28%</span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Артефакты</span>
                        <span className="font-semibold">18%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Медикаменты</span>
                        <span className="font-semibold">12%</span>
                      </div>
                      <Progress value={12} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Activity" size={20} />
                    Эффективность бота
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Средняя прибыль на сделку</p>
                      <p className="text-2xl font-bold text-success">₽5,430</p>
                      <p className="text-xs text-muted-foreground">+12% за неделю</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Время до продажи</p>
                      <p className="text-2xl font-bold text-secondary">2.4 часа</p>
                      <p className="text-xs text-muted-foreground">-18% за неделю</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">ROI (окупаемость)</p>
                      <p className="text-2xl font-bold text-warning">187%</p>
                      <p className="text-xs text-muted-foreground">+23% за неделю</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}