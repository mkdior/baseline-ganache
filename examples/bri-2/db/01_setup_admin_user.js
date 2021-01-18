this.db.createUser({
  user: 'bob',
  pwd: 'bob2021',
  roles: [
    { role: 'userAdmin', db: 'baseline' },
    { role: 'dbAdmin', db: 'baseline' },
    { role: 'readWrite', db: 'baseline' },
  ],
});

this.db.createUser({
  user: 'alice',
  pwd: 'alice2021',
  roles: [
    { role: 'userAdmin', db: 'baseline' },
    { role: 'dbAdmin', db: 'baseline' },
    { role: 'readWrite', db: 'baseline' },
  ],
});
