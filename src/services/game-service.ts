import { fromFetch } from 'rxjs/fetch';
import { catchError, EMPTY, map, Observable, Subject, take, tap } from 'rxjs';
import { DataHex } from '../models/grid';

export interface IHexData {
  x: number;
  y: number;
  z: number;
  value: number;
}

export class GameService {
  private baseUrl = 'http://localhost:13337/';
  private currentIndex: number = 1;
  private readonly dataSource = new Subject<DataHex[]>();
  readonly data$: Observable<DataHex[]> = this.dataSource.asObservable();

  constructor(hostname: string, port: string, private radius: number = 2) {
    this.setBaseUrl(hostname, port);
  }

  fetchNewItems(payload: DataHex[] = []): void {
    fromFetch(this.baseUrl + this.radius, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // todo: send only x, y, z, value
      selector: response => response.json()
    }).pipe(
      map((data: IHexData[]) =>
        data.map(({ x, y, z, value }: IHexData, i: number) => new DataHex(x, y, z, value, this.currentIndex + i))
      ),
      tap((data: DataHex[]) => {
        this.updateData(data);
        this.currentIndex += data.length;
      }),
      catchError((err) => {
        this.handleError(err?.message);
        return EMPTY;
      }),
      take(1),
    ).subscribe();
  }

  updateData(data: DataHex[]): void {
    this.dataSource.next(data);
  }

  handleError(message: string): void {
    this.dataSource.error(message);
  }

  private setBaseUrl(hostname: string, providedPort: string): void {
    const protocol = hostname === 'localhost' ? 'http' : 'https';
    const port = (providedPort && hostname === 'localhost') ? providedPort : '';
    this.baseUrl = `${protocol}://${hostname}:${port}/`;
  }

}
