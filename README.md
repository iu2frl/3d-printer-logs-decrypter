# Anycubic Log Decryptor

Static, client-side viewer for `log_1` / `log_2` files exported from some 3D printers
via the USB export menu. Decryption happens entirely in the browser using the
Web Crypto API — no file is ever sent to a server.

## Tested models

- Anycubic FW 3.0.5+
- Centauri Carbon FW 1.4.49+

## Usage

- Access the tool at [3d-printer-logs-decrypter](https://iu2frl.github.io/3d-printer-logs-decrypter)
- Upload `log_1` or `log_2`
- Check or download the decrypted output

## Notes

- The AES-256-CBC key/IV are specific to `log_1`/`log_2` log exports and were published by a
  community member on the
  [Klipper forum](https://klipper.discourse.group/t/printer-cfg-for-anycubic-kobra-2-plus-pro-max/11658/106).
- This does **not** decrypt firmware `update.bin`/`update.swu` packages — those use a
  different key and an MD5-checksummed header (see [OpenCentauri](https://docs.opencentauri.cc/software/updates/)).
