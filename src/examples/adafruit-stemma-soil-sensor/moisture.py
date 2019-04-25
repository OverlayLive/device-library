import time,json,sys
if sys.version_info[0]<3:
	raise Exception("must be using python 3")

from board import SCL, SDA
import busio

from adafruit_seesaw.seesaw import Seesaw

i2c_bus = busio.I2C(SCL, SDA)

ss = Seesaw(i2c_bus, addr=0x36)

while True:
    # read moisture level through capacitive touch pad
    touch = ss.moisture_read()

    # read temperature from the temperature sensor
    temp = ss.get_temp()
    myJson = '{"temp":'+str(temp)+',"moisture":'+str(touch)+'}'
    parsed = json.loads(myJson)
    print (json.dumps(parsed))
    time.sleep(1)

