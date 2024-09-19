import { useEffect, useState } from "react";
import toastr from "toastr";

/**
 * Hook reutilizable para obtener datos.
 * @param {Function} fetchDataFunction - Función que obtiene los datos.
 * @param {Array} fetchDependencies - Dependencias necesarias para la obtención de los datos.
 * @param {Array} dependencies - Dependencias del useEffect.
 * @returns {Object} - Un objeto que contiene los datos, estado de carga y una función para recargar los datos.
 */
export const useFetchData = (
  fetchDataFunction,
  fetchDependencies = [],
  dependencies = []
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchDataFunction(...fetchDependencies);
        setData(result);
      } catch (error) {
        toastr.error(error.message || "Error al cargar los datos");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [reload, ...dependencies]);

  const reloadData = () => setReload(!reload);

  return { isLoading, data, reloadData };
};
