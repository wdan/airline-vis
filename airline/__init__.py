from flask import Flask, url_for
import os

airline = Flask(__name__)

# Determines the destination of the build. Only usefull if you're using Frozen-Flask
airline.config['FREEZER_DESTINATION'] = os.path.dirname(os.path.abspath(__file__))+'/../build'

# Function to easily find your assets
# In your template use <link rel=stylesheet href="{{ static('filename') }}">
airline.jinja_env.globals['static'] = (
    lambda filename: url_for('static', filename = filename)
)

from airline import views
