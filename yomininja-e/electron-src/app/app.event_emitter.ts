import { EventEmitter } from 'node:events';

export class AppEventEmitter< TEventMap extends Record< symbol | string, any >  > extends EventEmitter {
  // Define a method that returns a typed EventEmitter for a specific event
  on< K extends keyof TEventMap  >(
    event: K,
    listener: ( data: TEventMap[K] ) => void
  ): this {
    return super.on( event.toString(), listener );
  }

  emit< K extends keyof TEventMap  >(
    event: K,
    data: TEventMap[K]
  ): boolean {
    return super.emit( event.toString(), data );
  }
}