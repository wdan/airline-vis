from flask import render_template
from airline import airline

@airline.route('/')
def index():
    return render_template('index.html')
