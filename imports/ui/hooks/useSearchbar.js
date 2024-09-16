import { useState, useMemo } from "react";

/**
 * Hook para buscar un texto en un arreglo de objetos.
 * @param {Array} data - El arreglo de objetos en el que se realiza la búsqueda.
 * @returns {Object} - Un objeto con el total de resultados y los datos filtrados.
 */
export const useSearch = (data) => {
  const [searchText, setSearchText] = useState("");

  const filteredData = useMemo(() => {
    if (!searchText) {
      return data;
    }

    const lowercasedSearchText = searchText.toLowerCase();
    return data.filter((item) => {
      return Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(lowercasedSearchText)
      );
    });
  }, [searchText, data]);

  return {
    searchText,
    setSearchText,
    total: filteredData.length,
    filteredData,
  };
};
