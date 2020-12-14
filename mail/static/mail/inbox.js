document.addEventListener('DOMContentLoaded', function() {
    
    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', () => compose_email('', '', ''));

    // By default, load the inbox
    load_mailbox('inbox');

    // Listener for sending emails
    document.querySelector('#compose-form').onsubmit = event => {
        event.preventDefault();
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })
        })
        .then(response => response.json())
        .then(result => {
            console.log(result);
            load_mailbox('sent');
        });
  }
});

function compose_email(sender, subject, body) {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#email-view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = sender;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
    
    // for each mailbox ...
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        emails.forEach(email => {
            const post = document.createElement('div');
            post.style.marginBottom = '10px';
            post.className = 'email';
            post.innerHTML =    `<p class="info-left"> \
                                    <strong>${email.sender}</strong> ${email.subject} \
                                    <span class="date-right">${email.timestamp}</span> \
                                </p>`;
            if (email.read === true){
                post.style.backgroundColor = 'grey';
            }
            post.onclick = () => load_email(email.id, mailbox);
            post.style.cursor = 'pointer';
            document.querySelector('#emails-view').append(post);
        });
    });
}

function load_email(id, mailbox){
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    
    if(mailbox === 'sent')
        document.querySelector('#archive').style.display = 'none';
    else 
        document.querySelector('#archive').style.display = 'initial';
    
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        document.querySelector('#sender').innerHTML = `<strong>From:</strong> ${email.sender}`;
        document.querySelector('#recipients').innerHTML = `<strong>To:</strong> ${email.recipients.join(', ')}`;
        document.querySelector('#subject').innerHTML = `<strong>Subject:</strong> ${email.subject}`;
        document.querySelector('#timestamp').innerHTML =  `<strong>Timestamp:</strong> ${email.timestamp}`;
        document.querySelector('#body').innerHTML = `${email.body}`;
        new_subject = email.subject;
        if(email.subject.length < 4 || email.subject.substring(0,4) !== 'Re: '){
            new_subject = `Re: ${email.subject}`;
        }
        new_body = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
        document.querySelector('#reply').onclick = () => compose_email(email.sender, new_subject, new_body);
        
        if(email.archived === true){
            document.querySelector('#archive').innerHTML = 'Unarchive Email';
            document.querySelector('#archive').onclick = () => {
                fetch(`/emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                });

                location = location;
            }
        } else {
            document.querySelector('#archive').innerHTML = 'Archive Email';
            document.querySelector('#archive').onclick = () => {
                fetch(`/emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: true
                    })
                });

                location = location;
            }
        }
        
    });

    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    });

}
