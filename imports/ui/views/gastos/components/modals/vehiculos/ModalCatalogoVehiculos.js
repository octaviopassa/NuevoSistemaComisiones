import React from "react";
import {
  Button,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  useClientPagination,
  useFetchData,
  useSearch,
} from "../../../../../hooks";
import { ModalButton } from "../ModalButton";
import { VehiculosService } from "../../../../../services";
import { ModalVehiculos } from "./ModalVehiculos";

export const ModalCatalogoVehiculos = ({ isModalOpen, toggle, plaza }) => {
  const {
    isLoading,
    data: vehiculos,
    reloadData,
  } = useFetchData(VehiculosService.getAll, [{ plaza }]);
  const { searchText, setSearchText, filteredData } = useSearch(
    vehiculos || []
  );

  console.log(vehiculos);
  const { paginatedData, PaginationComponent, PaginationSelector } =
    useClientPagination(filteredData);

  return (
    <Modal
      isOpen={isModalOpen}
      toggle={toggle}
      modalTransition={{ timeout: 400 }}
      size="lg"
    >
      <ModalHeader className="bg-primary text-white" toggle={toggle}>
        Catálogo de Vehículos
      </ModalHeader>
      <ModalBody>
        <div className="row">
          <div className="col-6">
            <ModalButton
              color="primary"
              buttonClasses="w-25 p-2"
              text="Nuevo"
              ModalComponent={ModalVehiculos}
              reloadData={reloadData}
            />
          </div>
          <div className="col-6 d-flex justify-content-end">
            <InputGroup className="mb-3">
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
              <th>Nombre</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  <Spinner color="primary"> </Spinner>
                </td>
              </tr>
            ) : (
              paginatedData.map((vehiculo, i) => (
                <tr key={i}>
                  <td>{vehiculo.Cod_Vehiculo}</td>
                  <td>{vehiculo.Nom_Vehiculo_Placa}</td>
                  <td>{vehiculo.Nom_Estatus}</td>
                  <td className="text-center">
                    <ModalButton
                      icon={faPencil}
                      ModalComponent={ModalVehiculos}
                      vehiculo={vehiculo}
                      reloadData={reloadData}
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

          <div className="col-sm-6 col-12 d-flex justify-content-end align-items-center">
            <p className="text-muted mb-0 mr-2">Items por página: </p>
            <PaginationSelector />
          </div>
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
