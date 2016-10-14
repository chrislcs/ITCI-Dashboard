from flask import Flask
from flask import render_template, request, jsonify
import psycopg2
from psycopg2.extensions import AsIs
import ConfigParser
import io

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


def read_db_config(fname):
    with open(fname) as f:
        config_file = f.read()

    config = ConfigParser.RawConfigParser(allow_no_value=True)
    config.readfp(io.BytesIO(config_file))

    database = config.get('database', 'database')
    user = config.get('database', 'user')
    password = config.get('database', 'password')
    host = config.get('database', 'host')
    port = config.getint('database', 'port')

    return [database, user, password, host, port]


def connect_to_db(database_config):
    try:
        conn = psycopg2.connect(database=database_config[0],
                                user=database_config[1],
                                password=database_config[2],
                                host=database_config[3],
                                port=database_config[4])
        conn.set_session(autocommit=False)
        return conn
    except:
        print "Unable to connect to the database"
        return None


@app.route("/retrieve_data")
def retrieve_data():
    shape = request.args.get('shape', 0, type=str)
    raster = request.args.get('raster', 0, type=str)
    possible_rasters = ['cassava', 'oilpalm', 'sugarpalm', 'transportdist_wgs']
    if raster.lower() in possible_rasters:
        database_config = read_db_config('database.config')
        conn = connect_to_db(database_config)
        cur = conn.cursor()

        query = "WITH Raster AS (SELECT rast FROM itci.public.%s),"\
                    "Polygon AS(SELECT ST_SetSRID(ST_GeomFromGeoJSON(%s),"\
                    "4326) geom) SELECT ST_SummaryStats(ST_Union("\
                    "ST_Clip(rast,geom)))FROM Raster, Polygon;"

        cur.execute(query, (AsIs(raster.lower()), shape))
        tables = cur.fetchall()
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
        raise ValueError('Raster not in database.', raster)


if __name__ == '__main__':
    app.run(debug=True)
