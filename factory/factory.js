Scenario: 
// Walmart has several different associate training programs. Three such training programs are cashier training, produce search training and inventory management training.
// All of these programs have similar behaviors. For each program, an associate can enroll into it, get their progress and obtain a certificate of completion.
// The store manager is the person who enrolls his or her associates into this program. This person needs to be able to enroll them via a desktop app, a mobile app and voice assistant. 
// Over time, more and more training programs will be added to the system. There may potentially be about a hundred of them and each program has different steps required to be completed for 
// enrollment to happen.

// Walmart labs already has an implementation for 3 programs. Though after 3 months of managers across the walmart org meeting and a few gray hairs later, 
// business requirements just flowed down to add 50 new training programs to the system. 

// Back at the office where the dev teams are, there is a developer, Bob Smith, who already has a react-native app implemented to enroll associates into the current programs and it looks like this: 

// enrollment.js: 
doEnrollment = (enrollmentType, user) => {
    if(enrollmentType == "cashier") {
        //enroll the cashier
        SRCR.sendRequest({ title: 'enroll a cashier', description: 'request to enroll ' + user + ' for cashier training'});
        CashierDBWrapper.updateEnrollment(user);
        CashRegisterProvisioningService.provisionRegister();
    } else if(enrollmentType == "produce") {
        //enroll the produce training
        produceCMS.addUser(user);
        SchedulingService.scheduleProduceTrainingForUser(user)
    } else if(enrollmentType == "inventory") {
        //enroll to inventory training
        InventoryMentorFinder.findMentorForUser(user);
        StoreDeviceManager.provisionTrainingDeviceForUser(user);
        SRCR.sendRequest({ title: 'enroll an inventory manager', description: 'request to enroll '+user+' to inventory management training' })
    } else {
       console.log('this enrollment type is not supported');
    }
}


<Text>Hello, please select the program you would like to enroll in</Text>
<Select>
    <Option value="cashier">Cashier Training</Option>
    <Option value="produce">Produce Training</Option>
    <Option value="inventory">Inventory Management Training</Option>
</Select>
<TextInput value='' name='username' prompt='enter the username to enroll' />
<SubmitButton onSubmit={doEnrollment}>Enroll</SubmitButton>

// Bob was just given this new requirement. Okay he says, no problem. I'll just make 50 if...else statments and we'll be good to go. 
// Then another developer named Sam W heard about what bob was thinking and thought.
// If we do it this way, it will be hard to share this logic among our deskop and voice assistant, we would need to revise the training process in 3 different places every time we make a change. 
// Im sure I'd also get really confused about whats going on when I need to start maintaining this as well. 

// ... Well, Now that we have 50 new programs coming in, maybe there is a better way... 
// What is this new way? 

// It is the way of the Facade. 
// So heres what the program structure can now look like
 
// enrollment.js: 
const TrainingProgramFactory = require('../services/trainingProgramFactory');

doEnrollment = (programName, user) => {
    TrainingProgramFactory(programName).enroll(user); //So simplified. Much good. 
}

<Text>Hello, please select the program you would like to enroll in</Text>
<Select>
    <Option value="cashier">Cashier Training</Option>
    <Option value="produce">Produce Training</Option>
    <Option value="inventory">Inventory Management Training</Option>
</Select>
<TextInput value='' name='username' prompt='enter the username to enroll' />
<SubmitButton onSubmit={doEnrollment}></SubmitButton>


// ... So how do we do this?


// Well first lets get into how Facade's work: 
// https://en.wikipedia.org/wiki/Factory_method_pattern

// We'll have two files: 
// TrainingProgramFactory.js (The creator)
const { cashierTrainingProgram, produceTrainingProgram, inventoryTrainingProgram } = require('./TrainingPrograms'); 

const TrainingProgramFactory = (programName) => {
    const trainingPrograms = {
        'cashier': cashierTraininProgram();
        'produce': produceTrainingProgram();
        'inventory': inventoryTrainingProgram();
    }

    return {
        enroll: trainingPrograms[programName].enroll;
    }
}
export default TrainingProgramFactory; //In OO based language, we would usually be extending an interface here


// Then in the training programs  (the products)
// TrainingPrograms.js (The product) 


const cashierTrainingProgram = () => {
    // ...some private stuff happening here...

    const enroll = (user) => {
        SRCR.sendRequest({ title: 'enroll a cashier', description: 'request to enroll ' + user + ' for cashier training'});
        CashierDBWrapper.updateEnrollment(user);
        CashRegisterProvisioningService.provisionRegister();
    }

    // ...other logic...

    return {
        enroll
    }
}

const produceTrainingProgram = () => {
    // ...some private stuff happening here...

    const enroll = (user) => {
        SRCR.sendRequest({ title: 'enroll a cashier', description: 'request to enroll ' + user + ' for cashier training'});
        CashierDBWrapper.updateEnrollment(user);
        CashRegisterProvisioningService.provisionRegister();
    }

    //...other logic...

    return {
        enroll
    }
}

const inventoryTrainingProgram = () => {
    // ...some private stuff happening here...

    const enroll = (user) => {
        InventoryMentorFinder.findMentorForUser(user);
        StoreDeviceManager.provisionTrainingDeviceForUser(user);
        SRCR.sendRequest({ title: 'enroll an inventory manager', description: 'request to enroll '+user+' to inventory management training' })
    }

    // ...other logic...

    return {
        enroll
    }
}
