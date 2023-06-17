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

export const groupStockByCode = (data) => {
  const temp = {}
  data.forEach((item) => {
    temp[item.codigo] = {
      ...temp[item.codigo],
      codigo: item.codigo,
      unidad: item.unidad_material,
      nombre: item.nombre,
      [item.estado] : item.total
    }
  })
  return Object.values(temp)
}
