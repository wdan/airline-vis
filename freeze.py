from flask_frozen import Freezer
from airline import airline

freezer = Freezer(airline)

if __name__ == '__main__':
    freezer.freeze()
