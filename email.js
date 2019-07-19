const mongoose = require("mongoose")
const nodeMailer = require('nodemailer')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/sumtransfer123', { useNewUrlParser: true })

const nameSchema = new mongoose.Schema({
    receiver: String,
    sender: String,
    subject: String,
    upfile:String,
    message: String
})
const baza_danych = mongoose.model('sum_baza', nameSchema)

const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'sum.transfer@gmail.com',
        pass: 'tymczasowe2019'
    }
})

const create_options_for_sender = ({ receiver, sender, subject, files, message, body }) => {
    const html = `
        <p> Wiadomość z formularza </p>
        <ul>
            <li>Mail do: ${ receiver}</li>
            <li>Mail od: ${ sender}</li>
            <li>Mail: ${ subject}</li>
        </ul>
        <h3> Wiadomość </h3>
        <p> Wysłałeś plik z wiadomością ${ message} </p>
        <p> ${files.pliczek.name}
        <p> Pozostała część wiadomości </p>
    `

    return {
        from: '"SUM Transfer" <sum.transfer@gmail.com>',
        text: body,
        to: receiver,
        subject, file, html,
    }
}

const create_options_for_receiver = ({ receiver, sender, subject, files, message, body }) => {
    const html = `
        <p> Wiadomość z formularza </p>
        <ul>
            <li>Mail do:  ${ receiver}</li>
            <li>Mail od: ${ sender}</li>
            <li>Mail: ${ subject}</li>
        </ul>
        <h3> Wiadomość </h3>
        <p> Otrzymałeś plik z wiadomością ${ message} </p>
        <p> ${files.pliczek.name}
        <p> Pozostała część wiadomości </p>
    `
    return {
        from: '"SUM Transfer" <sum.transfer@gmail.com>',
        text: body,
        to: sender,
        subject, file, html,
    }
}

const send_to_sender = (body) => new Promise((resolve, reject) => {
    transporter.sendMail(create_options_for_sender(body), (error, info) => {
        if (error) {
            reject(error)
        } else {
            console.log('Message %s sent: %s', info.messageId, info.response)
            resolve()
        }
    })
})

const send_to_receiver = (body) => new Promise((resolve, reject) => {
    transporter.sendMail(create_options_for_receiver(body), (error, info) => {
        if (error) {
            reject(error)
        } else {
            console.log('Message %s sent: %s', info.messageId, info.response)
            resolve()
        }
    })
})

const save_to_db = body => new Promise((resolve, reject) => {
    const myData = new baza_danych(body)
    myData
        .save()
        .then(item => resolve('Zapisano prawidłowo do bazy'))
        .catch(err => reject('Wystąpił błąd podczas zapisu do bazy danych', err)) 
})

module.exports = body => Promise.all([
    send_to_receiver(body),
    send_to_sender(body),
    save_to_db(body),
])