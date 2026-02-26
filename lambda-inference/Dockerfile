FROM public.ecr.aws/lambda/python:3.10 

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY model/saved_model /opt/ml/model/

COPY app.py ${LAMBDA_TASK_ROOT}

CMD [ "app.lambda_handler" ]