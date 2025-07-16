import { Component, inject, OnInit } from "@angular/core";
//import { Firestore, collection, collectionData, limit, query } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry, themeQuartz, colorSchemeDarkBlue } from "ag-grid-community";
import { AsyncPipe } from '@angular/common';
import { ref, onValue, Database } from '@angular/fire/database';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface IRow {
  name: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

@Component({
  standalone: true,
  imports: [AgGridAngular, AsyncPipe],
  selector: "app-grid-display",
  templateUrl: './grid-display.component.html',
  styleUrls: ['./grid-display.component.scss']
})
export class GridDisplayComponent implements OnInit {
  theme = themeQuartz.withPart(colorSchemeDarkBlue);;
  rowData$: Observable<IRow[]> = new Observable();
  colDefs: ColDef[] = [
    { field: "name", filter: 'agTextColumnFilter' },
    { field: "symbol", filter: 'agTextColumnFilter' },
    { field: "open" },
    { field: "high" },
    { field: "low" },
    {
      field: "close",
      cellStyle: params => {
        if (params.value > params.data.open) {
          return { color: '#4caf50', fontWeight: 'bold' }; // green for increase
        } else if (params.value < params.data.open) {
          return { color: '#f44336', fontWeight: 'bold' }; // red for decrease
        }
        return { color: '#fff', fontWeight: 'normal' };
      }
    },
    {
      headerName: "Change",
      valueGetter: params => {
        const open = params.data.open;
        const close = params.data.close;
        if (open == null || close == null) return '';
        const diff = close - open;
        const percent = open !== 0 ? (diff / open) * 100 : 0;
        const sign = diff > 0 ? '+' : '';
        return `${sign}${diff.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
      },
      comparator: (valueA, valueB, nodeA, nodeB) => {
        const getPercent = (val: any, node: any) => {
          if (node && node.data && node.data.open != null && node.data.close != null && node.data.open !== 0) {
            return ((node.data.close - node.data.open) / node.data.open) * 100;
          }
          // fallback: try to parse from string
          const match = typeof val === 'string' && val.match(/([-+]?\d*\.?\d+)%/);
          return match ? parseFloat(match[1]) : 0;
        };
        return getPercent(valueA, nodeA) - getPercent(valueB, nodeB);
      },
      cellStyle: params => {
        const open = params.data.open;
        const close = params.data.close;
        if (open == null || close == null) return { color: '#fff', fontWeight: 'normal' };
        if (close > open) {
          return { color: '#4caf50', fontWeight: 'bold' };
        } else if (close < open) {
          return { color: '#f44336', fontWeight: 'bold' };
        }
        return { color: '#fff', fontWeight: 'normal' };
      }
    }
  ];
  defaultColDef: ColDef = { flex: 1 };
  //private firestore: Firestore = inject(Firestore);
  private database: Database = inject(Database);

  ngOnInit(): void {
    const dbRef = ref(this.database, 'nse_bhavcopy');
    this.rowData$ = new Observable<IRow[]>(subscriber => {
      onValue(dbRef, snapshot => {
        const data = snapshot.val();
        // Convert object map to array and filter
        const rows = Object.values(data ?? {}).filter(
          (row: any) => row.name && row.name.trim() !== '' && row.open
        ) as IRow[];
        subscriber.next(rows);
      });
    });
  }
}
