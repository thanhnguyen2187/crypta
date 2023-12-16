// Copyright 2022 Roy T. Hashimoto. All Rights Reserved.
import * as VFS from './sqlite-constants';
export * from './sqlite-constants';

// Base class for a VFS.
export class Base {
  mxPathName = 64;

  /**
   * @param {number} fileId
   * @returns {number}
   */
  xClose(fileId: number) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {number} fileId
   * @param {Uint8Array} pData
   * @param {number} iOffset
   * @returns {number}
   */
  xRead(fileId: number, pData: Uint8Array, iOffset: number) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {number} fileId
   * @param {Uint8Array} pData
   * @param {number} iOffset
   * @returns {number}
   */
  xWrite(fileId: number, pData: Uint8Array, iOffset: number) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {number} fileId
   * @param {number} iSize
   * @returns {number}
   */
  xTruncate(fileId: number, iSize: number) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {number} fileId
   * @param {*} flags
   * @returns {number}
   */
  xSync(fileId: number, flags: number[]) {
    return VFS.SQLITE_OK;
  }

  /**
   * @param {number} fileId
   * @param {DataView} pSize64
   * @returns {number}
   */
  xFileSize(fileId: number, pSize64: DataView) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {number} fileId
   * @param {number} flags
   * @returns {number}
   */
  xLock(fileId: number, flags: number) {
    return VFS.SQLITE_OK;
  }

  /**
   * @param {number} fileId
   * @param {number} flags
   * @returns {number}
   */
  xUnlock(fileId: number, flags: number) {
    return VFS.SQLITE_OK;
  }

  /**
   * @param {number} fileId
   * @param {DataView} pResOut
   * @returns {number}
   */
  xCheckReservedLock(fileId: number, pResOut: DataView) {
    pResOut.setInt32(0, 0, true);
    return VFS.SQLITE_OK;
  }

  /**
   * @param {number} fileId
   * @param {number} op
   * @param {DataView} pArg
   * @returns {number}
   */
  xFileControl(fileId: number, op: number, pArg: DataView) {
    return VFS.SQLITE_NOTFOUND;
  }

  /**
   * @param {number} fileId
   * @returns {number}
   */
  xSectorSize(fileId: number) {
    return 512;
  }

  /**
   * @param {number} fileId
   * @returns {number}
   */
  xDeviceCharacteristics(fileId: number) {
    return 0;
  }

  /**
   * @param {string?} name
   * @param {number} fileId
   * @param {number} flags
   * @param {DataView} pOutFlags
   * @returns {number}
   */
  xOpen(name: string | undefined, fileId: number, flags: number, pOutFlags: DataView) {
    return VFS.SQLITE_CANTOPEN;
  }

  /**
   * @param {string} name
   * @param {number} syncDir
   * @returns {number}
   */
  xDelete(name: string, syncDir: number) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * @param {string} name
   * @param {number} flags
   * @param {DataView} pResOut
   * @returns {number}
   */
  xAccess(name: string, flags: number, pResOut: DataView) {
    return VFS.SQLITE_IOERR;
  }

  /**
   * Handle asynchronous operation. This implementation will be overriden on
   * registration by an Asyncify build.
   * @param {function(): Promise<number>} f
   * @returns {number}
   */
  handleAsync(f: () => Promise<number>): number {
    // This default implementation deliberately does not match the
    // declared signature. It will be used in testing VFS classes
    // separately from SQLite. This will work acceptably for methods
    // that simply return the handleAsync() result without using it.
    // @ts-ignore
    return f();
  }
}

export const FILE_TYPE_MASK = [
  VFS.SQLITE_OPEN_MAIN_DB,
  VFS.SQLITE_OPEN_MAIN_JOURNAL,
  VFS.SQLITE_OPEN_TEMP_DB,
  VFS.SQLITE_OPEN_TEMP_JOURNAL,
  VFS.SQLITE_OPEN_TRANSIENT_DB,
  VFS.SQLITE_OPEN_SUBJOURNAL,
  VFS.SQLITE_OPEN_SUPER_JOURNAL
].reduce((mask, element) => mask | element);
