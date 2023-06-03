export const groupById = (data) => {
  const temp = {};
  const dataGroupBy = data.reduce(function (acumulator, current) {
    var criteria = current.idMaterial;
    if (!temp[criteria]) {
      temp[criteria] = {
        idMaterial: current.idMaterial,
        cantidad: 0,
      };
      acumulator.push(temp[criteria]);
    }
    temp[criteria].cantidad += current.cantidad;
    return acumulator;
  }, []);
  return dataGroupBy;
};
