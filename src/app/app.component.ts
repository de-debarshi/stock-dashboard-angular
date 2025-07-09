import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Stock Market Data';
  private firestore: Firestore = inject(Firestore);
  stocks$: Observable<any[]> = new Observable();

  ngOnInit(): void {
    const stocksRef = collection(this.firestore, 'nse_bhavcopy');
    this.stocks$ = collectionData(stocksRef);

    /* this.stocks$.subscribe(data => {
      console.log('Stocks from Firestore:', data);
    }); */
  }
}
