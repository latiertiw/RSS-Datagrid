import DataElement from '../store/interfaces/DataElement';
import faker from 'faker';

export const generateMockData = (count: number): DataElement[] => {
	const data: DataElement[] = [];

	for (let i = 0; i < count; i += 1) {
		data.push({
			phone: faker.phone.phoneNumber(),
			firstName: i < 3 ? 'b' : 'a', //faker.name.findName(),
			lastName: faker.name.lastName(),
			age: faker.random.number(80),
			work: true,
			state: faker.address.state(),
			city: faker.address.city(),
		});
	}

	return data;
};
