from flask import Flask
from flask import render_template, request, jsonify
import psycopg2
from psycopg2.extensions import AsIs

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


def connect_to_db():
    try:
        conn = psycopg2.connect(database='itci', user='postgres',
                                password='geodan123', host='localhost',
                                port=5433)
        conn.set_session(autocommit=False)
        return conn
    except:
        print "Unable to connect to the database"
        return None


@app.route("/retrieve_data")
def retrieve_data():
    shape = request.args.get('shape', 0, type=str)
    crop = request.args.get('crop', 0, type=str)
    possible_crops = ['cassava', 'oilpalm', 'sugarpalm']
    possible_other = ['transportdist_wgs']
    if crop.lower() in possible_crops or crop.lower() in possible_other:
        conn = connect_to_db()
        cur = conn.cursor()

        query = "WITH Raster AS (SELECT rast FROM itci.public.%s),"\
                    "Polygon AS(SELECT ST_SetSRID(ST_GeomFromGeoJSON(%s),"\
                    "4326) geom) SELECT ST_SummaryStats(ST_Union("\
                    "ST_Clip(rast,geom)))"\
                    "FROM Raster, Polygon;"

        cur.execute(query, (AsIs(crop.lower()), shape))
        tables = cur.fetchall()
        print(tables)
        col_names = ['count', 'sum', 'mean', 'stdev', 'min', 'max']
        data = {}
        for i, t in enumerate(tables):
            t = t[0].replace('(', '')
            t = t.replace(')', '')
            t = t.split(',')
            t = [float(n) for n in t]
            t[0] = int(t[0])

            temp = {}
            for j, name in enumerate(col_names):
                temp[col_names[j]] = t[j]

            data[str(i+1)] = temp


        cur.close()
        conn.close()

        return jsonify(**data)
    else:
        raise ValueError('Crop not in database.', crop)


if __name__ == '__main__':
    app.run(debug=True)
