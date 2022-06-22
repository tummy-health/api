const handler = async (event) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message:
        'Go Serverless v3.0! Your function executed successfully (yay typescript)!',
      input: event,
    },
    null,
    2
  ),
});

export default handler;
