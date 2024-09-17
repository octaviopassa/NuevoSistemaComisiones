import React, { useEffect, useState } from "react";
import { ProveedoresService } from "../../../services";
import toastr from "toastr";

export const useGetAllProveedores = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        setIsLoading(true);
        const proveedores = await ProveedoresService.getAll();
        setProveedores(proveedores);
      } catch (error) {
        toastr.error(error.message);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProviders();
  }, [reload]);

  const reloadData = () => setReload(!reload);

  return { isLoading, proveedores, total: proveedores.length, reloadData };
};
