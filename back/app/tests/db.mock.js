const mockCreateDb = () => {
  const mockUsers = [];
  const mockListings = [];

  const dbMock = {
    query: jest.fn().mockImplementation((query, params) => {
      if (query.includes('INSERT INTO users')) {
        const user = {
          id: mockUsers.length + 1,
          telegram_id: params[0],
          contact_number: params[1],
          name: params[2],
        };
        mockUsers.push(user);
        return { rows: [user] };
      } else if (query.includes('SELECT * FROM users WHERE telegram_id')) {
        const user = mockUsers.find(u => u.telegram_id === params[0]);
        return { rows: user ? [user] : [] };
      } else if (query.includes('INSERT INTO listings')) {
        const listing = {
          id: mockListings.length + 1,
          user_id: params[0],
          name: params[1],
          location: params[2],
          amount: params[3],
          photo_urls: params[4],
          price: params[5],
          expiration_date: params[6],
        };
        mockListings.push(listing);
        return { rows: [listing] };
      } else if (query.includes('SELECT * FROM listings')) {
        return { rows: mockListings };
      } else if (query.includes('SELECT NOW()')) {
        return { rows: [{ now: new Date() }] };
      }
      return { rows: [] };
    }),
  };

  const poolMock = {
    connect: jest.fn().mockResolvedValue({
      query: dbMock.query,
      release: jest.fn(),
    }),
    query: dbMock.query,
    on: jest.fn(),
  };

  return { poolMock, mockUsers, mockListings };
};

module.exports = mockCreateDb;