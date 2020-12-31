

export const respondSuccess = (res, data, status) => {
  res.status(status || 200).send({ data: data})
};

export const respondError = (res, error, status) => {
  res.status(status || 400).send({ error })
}
