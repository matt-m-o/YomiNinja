import { app } from 'electron';

export type ExitHandler = (exitCode?: number) => void | Promise<void>;

export class AppExitHandler {

  private isQuitting = false;
  private handler: ExitHandler = () => {};

  constructor() {}

  public setAppExitHandler( handler: ExitHandler ): void {
    this.handler = handler;
    
    // Electron quit event
    app.on('quit', () => this.quit(0) );

    // UNIX signals
    [ 'SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP', 'SIGSEGV' ].forEach( signal => {
      process.on( signal as NodeJS.Signals, () => {
        console.log(`Received ${signal}`);
        this.quit(0);
      });
    });

    // Windows console events
    process.on('SIGBREAK', () => {
      console.log('SIGBREAK received');
      this.quit(0);
    });

    // Node lifecycle
    process.on('beforeExit', code => {
      console.log(`beforeExit (code=${code})`);
      this.quit(code);
    });
    process.on('exit', code => {
      console.log(`exit (code=${code})`);
      // no async work possible here
    });

    // Uncaught errors
    process.on('uncaughtException', err => {
      console.error('Uncaught exception, shutting down:', err);
      this.quit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      // this.quit(1);
    });
  }

  private quit(exitCode = 0): void {

    if (this.isQuitting) return;
    this.isQuitting = true;

    // invoke user handler (sync or async)
    try {
      const result = this.handler( exitCode );
      // If they return a promise, we could await—but 
      // calling process.exit() will force immediate shutdown,
      // so usually you want your handler to finish synchronously.
      if (result instanceof Promise) {
        result.catch(err => {
          console.error('Error in exit handler:', err);
        });
      }
    } catch (err) {
      console.error('Error running exit handler:', err);
    }

    // let Electron clean up
    app.quit();

    // ensure process actually exits
    process.exit(exitCode);
  }
}