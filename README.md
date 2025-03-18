# Smart-Education-Events-System

## MongoDB Schema Alterations
1. **Create virtual environment in project directory (if not done so already)**  

```python
python -m venv venv
source venv/bin/activate
```
   
2. **Install necessary python requirements**

```python
pip install -r requirements.txt
```

3. **Make your shcema changes in `/backend/model/modelApp/schemas`**
4. **Migrate changes in `/backend/model`**

```python
python manage.py makemigrations
python manage.py migrate
```

 
