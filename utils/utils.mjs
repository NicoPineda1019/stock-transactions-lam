import xlsx from 'xlsx';

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

export const transformBase64ToJson = (base64) => {
  const result = {};
  try {
    const workbook = xlsx.read(base64, {type: "base64"});
    workbook.SheetNames.forEach(function(sheetName) {
      const roa = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if (roa.length > 0) {
        result[sheetName] = roa;
      }
    })
  } catch (error) {
    console.error(error)
  }
  return result
}