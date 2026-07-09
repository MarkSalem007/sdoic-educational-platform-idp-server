export default Object.freeze({
    from: process.env.MAIL_FROM,
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT)
});