import React, { useState } from "react";
import {
  Button,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import { useGetAllProveedores } from "../../hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useClientPagination, useSearch } from "../../../../hooks";

export const ModalProveedores = ({ isModalOpen, toggle }) => {
  const { isLoading, proveedores } = useGetAllProveedores();
  const { searchText, setSearchText, filteredData } = useSearch(
    proveedores || []
  );
  //TODO: Hacer el filtrado de los proveedores
  const [itemsPerPage] = useState(10);

  const { paginatedData, PaginationComponent } = useClientPagination(
    filteredData,
    itemsPerPage
  );

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={toggle}
      modalTransition={{ timeout: 400 }}
      size="lg"
    >
      <ModalHeader className="bg-primary text-white" toggle={toggle}>
        Catálogo de Proveedores
      </ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-12 d-flex justify-content-end">
            <InputGroup className="mb-3 col-sm-6 col-md-5">
              <Input
                placeholder="Buscar..."
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              <InputGroupText>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroupText>
            </InputGroup>
          </div>
        </div>

        <Table responsive striped bordered>
          <thead>
            <tr>
              <th>#</th>
              <th>Proveedoredor</th>
              <th>RFC</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>Cargando...</tr>
            ) : (
              paginatedData.map((proveedor, i) => (
                <tr key={i}>
                  <td>{proveedor.codigo}</td>
                  <td>{proveedor.nombre}</td>
                  <td>{proveedor.rfc}</td>
                  <td>{proveedor.estatus}</td>
                  <td className="text-center">
                    <FontAwesomeIcon
                      cursor={"pointer"}
                      className=""
                      icon={faPencil}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <div className="row mt-2">
          <div className="col-sm-6 col-12">
            <PaginationComponent />
          </div>

          <div className="col-sm-6 col-12">filter</div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
