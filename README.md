# Innopolis-Hackaton

Разработка git diff view 

# Prerequisites
Python 3.x
pip
Node.js and npm (for the React frontend)

# Развертывание сервера

```git clone https://github.com/AISTALK/Innopilis-Hackaton.git```

```cd <repo-directory>```

```python -m venv venv```

```source venv/bin/activate```

```pip install -r requirements.txt```

```python main.py```

# Установка зависимостей и запуск фронта

```cd diff-viewer```

```npm i```
Если возникает ошибка с react-diff-viewer, то выполните команду ```npm install react-diff-viewer —save —legacy-peer-deps```

```npm start```

После всех команд фронт поднимется на 3000 порту, а сервер на 5000.

# Использование
При первом использовании укажите внутри main.py свой локальный репозиторий!

Зайдите на http://localhost:3000

Выберите любой локальный репозиторий и укажите абсолютный путь к нему. 

После этого у вас появится возможность сравнивать коммиты.