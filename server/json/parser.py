from jsonschema import validate
import json


ju= json.load(open('kk.json'))

schema = json.load(open('schema'))
if  validate(ju, schema) is None:
    for data in ju.get('endpoints',None):
	for mets in  data.get('methods',None):
            print ju.get('name',None),data.get('path',None), mets.get('method',None), mets.get('result',None)



            
