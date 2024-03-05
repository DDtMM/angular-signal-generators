import { Injectable } from '@angular/core';
import { default as sampleData } from './shop.service.data.json';
import { Observable, timer, map } from 'rxjs';

interface Entity {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  defaultExecutionTime = 2000;
  getCustomers(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...sampleData.customers]));
  }
  getCustomerProducts(customerId: number): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(
      map(() =>
        sampleData.orders
          .filter((x) => x.customerId === customerId)
          .flatMap((x) => x.products.map((orderProductId) => sampleData.products.find((x) => x.id === orderProductId)))
          .filter((x): x is NonNullable<typeof x> => !!x)
      )
    );
  }

  getProducts(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...sampleData.products]));
  }
}
