import json

from channels.generic.websocket import WebsocketConsumer


class BaseConsumer(WebsocketConsumer):
    @classmethod
    def get_data(cls, text_data=None):
        data = json.loads(text_data)
        return data.get("action", None), data.get("data", None)

    def connect(self):
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        action, data = self.get_data(text_data)

        try:
            response_object = getattr(self, f"action_{action.lower()}")(**data)
        except TypeError as e:
            msg = str(e).split(")")[1]
            response_object = {"error": f"{msg}"}
        except AttributeError as e:
            msg = " ".join(str(e).split("'")[2:-1])
            response_object = {"error": f"{msg}"}

        response_object["action"] = action
        self.send(text_data=json.dumps(response_object))

    def disconnect(self, code):
        pass
