import { Injectable } from '@angular/core';
import { Observable, timer, map } from 'rxjs';

interface Entity {
  id: number;
  name: string;
}

const DEMO_DATA = {
  customers: [
    { "id": 1, "name": "Danny Gimenez" },
    { "id": 2, "name": "Joe Sanchez" },
    { "id": 3, "name": "Terry Terry" },
    { "id": 4, "name": "Suzan Sales" }
  ],
  orders: [
    { "id": 1, "customerId": 1, "products": [1, 3] },
    { "id": 2, "customerId": 2, "products": [2, 4] },
    { "id": 3, "customerId": 3, "products": [5, 7] },
    { "id": 4, "customerId": 4, "products": [6, 8] }
  ],
  products: [
    { "id": 1, "name": "Car" },
    { "id": 2, "name": "Dog" },
    { "id": 3, "name": "Bunny" },
    { "id": 4, "name": "Video Game" },
    { "id": 5, "name": "Atari" },
    { "id": 6, "name": "Rad Skate Board" },
    { "id": 7, "name": "Scary Terry Doll" },
    { "id": 8, "name": "Globe" }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  defaultExecutionTime = 2000;
  getCustomers(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.customers]));
  }
  getCustomerProducts(customerId: number): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(
      map(() =>
      DEMO_DATA.orders
          .filter((x) => x.customerId === customerId)
          .flatMap((x) => x.products.map((orderProductId) => DEMO_DATA.products.find((x) => x.id === orderProductId)))
          .filter((x): x is NonNullable<typeof x> => !!x)
      )
    );
  }

  getProducts(): Observable<Entity[]> {
    return timer(this.defaultExecutionTime).pipe(map(() => [...DEMO_DATA.products]));
  }
}
