export function generateUUID(): string {
    // Generate a random 32-bit number
    const randomUint32 = () => Math.floor(Math.random() * 0x100000000);

    // Convert the random number to a hexadecimal string
    const hexString = (value: number): string => value.toString(16).padStart(8, '0');

    // Create the UUIDv4 format
    const uuid = (
        hexString(randomUint32()) + '-' +
        hexString(randomUint32() & 0xFFFF0FFF | 0x4000) + '-' +
        hexString(randomUint32() & 0xBFFFFFFF | 0x80000000) + '-' +
        hexString(randomUint32()) + '-' +
        hexString(randomUint32())
    ).toLowerCase();

    return uuid;
}