import React, { useState, useMemo } from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

/**
 * Hook para manejar la paginación en el cliente.
 * @param {Array} data - Los datos a paginar.
 * @param {number} itemsPerPage - Número de ítems por página.
 * @returns {Object} - Un objeto con la paginación, incluyendo datos paginados y el total de páginas.
 */
export const useClientPagination = (data, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const getPaginationRange = () => {
    const pageRange = [];
    const maxPages = 3;

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pageRange.push(i);
      }
    } else {
      const halfMaxPages = Math.floor(maxPages / 2);
      let start = Math.max(1, currentPage - halfMaxPages);
      let end = Math.min(totalPages, currentPage + halfMaxPages);

      if (currentPage <= halfMaxPages) {
        end = Math.min(maxPages, totalPages);
      }
      if (currentPage >= totalPages - halfMaxPages) {
        start = Math.max(1, totalPages - maxPages + 1);
      }

      if (start > 1) {
        pageRange.push(1);
        if (start > 2) {
          pageRange.push("...");
        }
      }

      for (let i = start; i <= end; i++) {
        pageRange.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) {
          pageRange.push("...");
        }
        pageRange.push(totalPages);
      }
    }

    return pageRange;
  };

  const PaginationComponent = () => (
    <Pagination>
      <PaginationItem disabled={currentPage === 1}>
        <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </PaginationLink>
      </PaginationItem>

      {getPaginationRange().map((page, index) => (
        <PaginationItem
          key={index}
          active={page === currentPage}
          disabled={page === "..."}
        >
          <PaginationLink
            onClick={() => {
              if (page !== "...") {
                handlePageChange(page);
              }
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      ))}

      <PaginationItem disabled={currentPage === totalPages}>
        <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
          <FontAwesomeIcon icon={faAngleRight} />
        </PaginationLink>
      </PaginationItem>
    </Pagination>
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    PaginationComponent,
    handlePageChange,
  };
};
