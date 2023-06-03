export const groupById = (data) => {
  const temp = {};
  const dataGroupBy = data.reduce(function (acumulator, current) {
    var criteria = current.id;
    if (!temp[criteria]) {
      temp[criteria] = {
        id: current.id,
        cant: 0,
      };
      acumulator.push(temp[criteria]);
    }
    temp[criteria].cant += current.cant;
    return acumulator;
  }, []);
  return dataGroupBy;
};
