import  { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Paginator } from "primereact/paginator";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-blue/theme.css"
import "primereact/resources/primereact.min.css";              
import "primeicons/primeicons.css";                           


interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/.netlify/functions';

export default function ArtworkTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [rowsToSelect, setRowsToSelect] = useState<number | null>(null);

  const op = useRef<OverlayPanel>(null);

  const fetchArtworks = async (pageNum: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/artworks?page=${pageNum}`);
      const data = await res.json();
      setArtworks(data.artworks);
      setTotalRecords(data.pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching artworks:", err);
    }
  };

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  //  Handles selecting N rows starting from current page
  const handleSelectRows = async () => {
    if (!rowsToSelect || rowsToSelect <= 0) return;

    let selected: Artwork[] = [];
    let currentPage = page;
    let remaining = rowsToSelect;

    while (remaining > 0) {
      
      const res = await fetch(`${API_BASE_URL}/artworks?page=${currentPage}`);
      const data = await res.json();

      // select from this page
      const slice = data.artworks.slice(0, remaining); 
      selected = [...selected, ...slice];

      remaining -= slice.length;
      currentPage++;
    }

    setSelectedArtworks(selected);
    op.current?.hide();
  };

  // Custom header with chevron and overlay trigger
  const idHeaderTemplate = () => (
    <div className="flex align-items-center gap-2">
      <span>ID</span>
      <i
        className="pi pi-chevron-down cursor-pointer"
        onClick={(e) => op.current?.toggle(e)}
      ></i>

      <OverlayPanel ref={op}>
        <div className="p-3 w-64">
          <h4>Select Rows</h4>
          <InputNumber
            value={rowsToSelect || 0}
            onValueChange={(e) => setRowsToSelect(e.value ?? 0)}
            showButtons
            min={1}
            max={totalRecords}
            placeholder="Enter number of rows"
            className="w-full mb-3"
          />
          <Button
            label="Submit"
            icon="pi pi-check"
            onClick={handleSelectRows}
            className="w-full"
          />
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="mb-3">Artworks</h2>

      <DataTable
        value={artworks}
        paginator={false}
        stripedRows
        showGridlines
        selectionMode="checkbox"
        selection={selectedArtworks}
        onSelectionChange={(e) => setSelectedArtworks(e.value)}
        dataKey="id"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="id" header={idHeaderTemplate} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      {/* Selected rows counter */}
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "white",
        borderTop: "1px solid #ddd",
        padding: "10px 20px",
        textAlign: "center",
        zIndex: 1000,
      }}
    >
      <h2>Total Rows Selected: {selectedArtworks.length}</h2>
    </div>

      <Paginator
        first={(page - 1) * 12}
        rows={12}
        totalRecords={totalRecords}
        onPageChange={(e) => setPage(e.page + 1)}
        className="mt-3 mb-7"
      />
    </div>
  );
}
