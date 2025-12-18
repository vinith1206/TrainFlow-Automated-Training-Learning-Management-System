import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tmds.com' },
    update: {},
    create: {
      email: 'admin@tmds.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create Trainer
  const trainerPassword = await bcrypt.hash('trainer123', 10);
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer@tmds.com' },
    update: {
      password: trainerPassword,
      isActive: true,
    },
    create: {
      email: 'trainer@tmds.com',
      password: trainerPassword,
      firstName: 'John',
      lastName: 'Trainer',
      role: 'TRAINER',
      isActive: true,
    },
  });

  // Create Participant (generic test account)
  const genericParticipantPassword = await bcrypt.hash('participant123', 10);
  const participant = await prisma.user.upsert({
    where: { email: 'participant@tmds.com' },
    update: {
      password: genericParticipantPassword,
      isActive: true,
    },
    create: {
      email: 'participant@tmds.com',
      password: genericParticipantPassword,
      firstName: 'Test',
      lastName: 'Participant',
      role: 'PARTICIPANT',
      isActive: true,
    },
  });

  // Create Participants with 100 Indian Names
  const participantPassword = await bcrypt.hash('participant123', 10);
  const participants = [
    { email: 'arjun.sharma@tmds.com', firstName: 'Arjun', lastName: 'Sharma' },
    { email: 'priya.patel@tmds.com', firstName: 'Priya', lastName: 'Patel' },
    { email: 'rahul.kumar@tmds.com', firstName: 'Rahul', lastName: 'Kumar' },
    { email: 'kavya.singh@tmds.com', firstName: 'Kavya', lastName: 'Singh' },
    { email: 'vikram.reddy@tmds.com', firstName: 'Vikram', lastName: 'Reddy' },
    { email: 'ananya.iyer@tmds.com', firstName: 'Ananya', lastName: 'Iyer' },
    { email: 'aditya.menon@tmds.com', firstName: 'Aditya', lastName: 'Menon' },
    { email: 'meera.nair@tmds.com', firstName: 'Meera', lastName: 'Nair' },
    { email: 'rohan.desai@tmds.com', firstName: 'Rohan', lastName: 'Desai' },
    { email: 'divya.joshi@tmds.com', firstName: 'Divya', lastName: 'Joshi' },
    { email: 'siddharth.gupta@tmds.com', firstName: 'Siddharth', lastName: 'Gupta' },
    { email: 'neha.agarwal@tmds.com', firstName: 'Neha', lastName: 'Agarwal' },
    { email: 'karan.malhotra@tmds.com', firstName: 'Karan', lastName: 'Malhotra' },
    { email: 'isha.kapoor@tmds.com', firstName: 'Isha', lastName: 'Kapoor' },
    { email: 'aman.verma@tmds.com', firstName: 'Aman', lastName: 'Verma' },
    { email: 'tanvi.bansal@tmds.com', firstName: 'Tanvi', lastName: 'Bansal' },
    { email: 'yash.chopra@tmds.com', firstName: 'Yash', lastName: 'Chopra' },
    { email: 'riya.mehta@tmds.com', firstName: 'Riya', lastName: 'Mehta' },
    { email: 'akash.saxena@tmds.com', firstName: 'Akash', lastName: 'Saxena' },
    { email: 'pooja.tiwari@tmds.com', firstName: 'Pooja', lastName: 'Tiwari' },
    { email: 'varun.pandey@tmds.com', firstName: 'Varun', lastName: 'Pandey' },
    { email: 'shreya.mishra@tmds.com', firstName: 'Shreya', lastName: 'Mishra' },
    { email: 'harsh.dubey@tmds.com', firstName: 'Harsh', lastName: 'Dubey' },
    { email: 'anjali.trivedi@tmds.com', firstName: 'Anjali', lastName: 'Trivedi' },
    { email: 'nitin.shukla@tmds.com', firstName: 'Nitin', lastName: 'Shukla' },
    { email: 'sneha.bhatt@tmds.com', firstName: 'Sneha', lastName: 'Bhatt' },
    { email: 'manish.rao@tmds.com', firstName: 'Manish', lastName: 'Rao' },
    { email: 'kritika.shetty@tmds.com', firstName: 'Kritika', lastName: 'Shetty' },
    { email: 'abhishek.naidu@tmds.com', firstName: 'Abhishek', lastName: 'Naidu' },
    { email: 'swati.krishnan@tmds.com', firstName: 'Swati', lastName: 'Krishnan' },
    { email: 'saurabh.pillai@tmds.com', firstName: 'Saurabh', lastName: 'Pillai' },
    { email: 'deepika.rajan@tmds.com', firstName: 'Deepika', lastName: 'Rajan' },
    { email: 'pranav.venkatesh@tmds.com', firstName: 'Pranav', lastName: 'Venkatesh' },
    { email: 'amrita.subramanian@tmds.com', firstName: 'Amrita', lastName: 'Subramanian' },
    { email: 'rajat.chandrasekhar@tmds.com', firstName: 'Rajat', lastName: 'Chandrasekhar' },
    { email: 'nidhi.raman@tmds.com', firstName: 'Nidhi', lastName: 'Raman' },
    { email: 'gaurav.murthy@tmds.com', firstName: 'Gaurav', lastName: 'Murthy' },
    { email: 'rashmi.srinivasan@tmds.com', firstName: 'Rashmi', lastName: 'Srinivasan' },
    { email: 'mohit.raghavan@tmds.com', firstName: 'Mohit', lastName: 'Raghavan' },
    { email: 'sonal.iyengar@tmds.com', firstName: 'Sonal', lastName: 'Iyengar' },
    { email: 'ankit.narayan@tmds.com', firstName: 'Ankit', lastName: 'Narayan' },
    { email: 'urvashi.krishnamurthy@tmds.com', firstName: 'Urvashi', lastName: 'Krishnamurthy' },
    { email: 'rishabh.raghunathan@tmds.com', firstName: 'Rishabh', lastName: 'Raghunathan' },
    { email: 'aishwarya.sundaram@tmds.com', firstName: 'Aishwarya', lastName: 'Sundaram' },
    { email: 'kunal.varadarajan@tmds.com', firstName: 'Kunal', lastName: 'Varadarajan' },
    { email: 'shweta.ramaswamy@tmds.com', firstName: 'Shweta', lastName: 'Ramaswamy' },
    { email: 'tushar.seshadri@tmds.com', firstName: 'Tushar', lastName: 'Seshadri' },
    { email: 'madhuri.anand@tmds.com', firstName: 'Madhuri', lastName: 'Anand' },
    { email: 'nikhil.balakrishnan@tmds.com', firstName: 'Nikhil', lastName: 'Balakrishnan' },
    { email: 'pallavi.gopalakrishnan@tmds.com', firstName: 'Pallavi', lastName: 'Gopalakrishnan' },
    { email: 'abhay.madhavan@tmds.com', firstName: 'Abhay', lastName: 'Madhavan' },
    { email: 'juhi.ramakrishnan@tmds.com', firstName: 'Juhi', lastName: 'Ramakrishnan' },
    { email: 'sahil.sundararajan@tmds.com', firstName: 'Sahil', lastName: 'Sundararajan' },
    { email: 'radhika.viswanathan@tmds.com', firstName: 'Radhika', lastName: 'Viswanathan' },
    { email: 'darshan.iyer@tmds.com', firstName: 'Darshan', lastName: 'Iyer' },
    { email: 'manasi.nambiar@tmds.com', firstName: 'Manasi', lastName: 'Nambiar' },
    { email: 'jayesh.warrier@tmds.com', firstName: 'Jayesh', lastName: 'Warrier' },
    { email: 'vidya.krishnamoorthy@tmds.com', firstName: 'Vidya', lastName: 'Krishnamoorthy' },
    { email: 'omkar.raghavendra@tmds.com', firstName: 'Omkar', lastName: 'Raghavendra' },
    { email: 'chaitra.ramachandran@tmds.com', firstName: 'Chaitra', lastName: 'Ramachandran' },
    { email: 'surya.shanmugam@tmds.com', firstName: 'Surya', lastName: 'Shanmugam' },
    { email: 'lakshmi.ganesan@tmds.com', firstName: 'Lakshmi', lastName: 'Ganesan' },
    { email: 'devansh.ramanathan@tmds.com', firstName: 'Devansh', lastName: 'Ramanathan' },
    { email: 'samriddhi.selvam@tmds.com', firstName: 'Samriddhi', lastName: 'Selvam' },
    { email: 'aryan.karthikeyan@tmds.com', firstName: 'Aryan', lastName: 'Karthikeyan' },
    { email: 'aditi.ravi@tmds.com', firstName: 'Aditi', lastName: 'Ravi' },
    { email: 'vivek.manoj@tmds.com', firstName: 'Vivek', lastName: 'Manoj' },
    { email: 'shruti.sanjay@tmds.com', firstName: 'Shruti', lastName: 'Sanjay' },
    { email: 'dhruv.ashwin@tmds.com', firstName: 'Dhruv', lastName: 'Ashwin' },
    { email: 'ishita.arjun@tmds.com', firstName: 'Ishita', lastName: 'Arjun' },
    { email: 'kartik.rahul@tmds.com', firstName: 'Kartik', lastName: 'Rahul' },
    { email: 'tanya.vikram@tmds.com', firstName: 'Tanya', lastName: 'Vikram' },
    { email: 'rishit.aditya@tmds.com', firstName: 'Rishit', lastName: 'Aditya' },
    { email: 'aanya.rohan@tmds.com', firstName: 'Aanya', lastName: 'Rohan' },
    { email: 'ayush.siddharth@tmds.com', firstName: 'Ayush', lastName: 'Siddharth' },
    { email: 'kiara.karan@tmds.com', firstName: 'Kiara', lastName: 'Karan' },
    { email: 'ved.aman@tmds.com', firstName: 'Ved', lastName: 'Aman' },
    { email: 'myra.varun@tmds.com', firstName: 'Myra', lastName: 'Varun' },
    { email: 'aarav.harsh@tmds.com', firstName: 'Aarav', lastName: 'Harsh' },
    { email: 'zara.nitin@tmds.com', firstName: 'Zara', lastName: 'Nitin' },
    { email: 'rehan.manish@tmds.com', firstName: 'Rehan', lastName: 'Manish' },
    { email: 'siya.saurabh@tmds.com', firstName: 'Siya', lastName: 'Saurabh' },
    { email: 'veer.pranav@tmds.com', firstName: 'Veer', lastName: 'Pranav' },
    { email: 'anvi.gaurav@tmds.com', firstName: 'Anvi', lastName: 'Gaurav' },
    { email: 'kabir.mohit@tmds.com', firstName: 'Kabir', lastName: 'Mohit' },
    { email: 'diya.ankit@tmds.com', firstName: 'Diya', lastName: 'Ankit' },
    { email: 'arav.rishabh@tmds.com', firstName: 'Arav', lastName: 'Rishabh' },
    { email: 'eva.kunal@tmds.com', firstName: 'Eva', lastName: 'Kunal' },
    { email: 'reyansh.tushar@tmds.com', firstName: 'Reyansh', lastName: 'Tushar' },
    { email: 'saanvi.nikhil@tmds.com', firstName: 'Saanvi', lastName: 'Nikhil' },
    { email: 'vihaan.abhay@tmds.com', firstName: 'Vihaan', lastName: 'Abhay' },
    { email: 'anaya.sahil@tmds.com', firstName: 'Anaya', lastName: 'Sahil' },
    { email: 'advik.darshan@tmds.com', firstName: 'Advik', lastName: 'Darshan' },
    { email: 'prisha.jayesh@tmds.com', firstName: 'Prisha', lastName: 'Jayesh' },
    { email: 'krish.omkar@tmds.com', firstName: 'Krish', lastName: 'Omkar' },
    { email: 'navya.surya@tmds.com', firstName: 'Navya', lastName: 'Surya' },
    { email: 'arush.devansh@tmds.com', firstName: 'Arush', lastName: 'Devansh' },
    { email: 'inaya.aryan@tmds.com', firstName: 'Inaya', lastName: 'Aryan' },
    { email: 'atharv.vivek@tmds.com', firstName: 'Atharv', lastName: 'Vivek' },
    { email: 'anika.dhruv@tmds.com', firstName: 'Anika', lastName: 'Dhruv' },
    { email: 'rishaan.kartik@tmds.com', firstName: 'Rishaan', lastName: 'Kartik' },
    { email: 'avni.rishit@tmds.com', firstName: 'Avni', lastName: 'Rishit' },
    { email: 'vivaan.ayush@tmds.com', firstName: 'Vivaan', lastName: 'Ayush' },
    { email: 'sara.ved@tmds.com', firstName: 'Sara', lastName: 'Ved' },
    { email: 'yuvan.aarav@tmds.com', firstName: 'Yuvan', lastName: 'Aarav' },
    { email: 'ahana.rehan@tmds.com', firstName: 'Ahana', lastName: 'Rehan' },
    { email: 'arhaan.veer@tmds.com', firstName: 'Arhaan', lastName: 'Veer' },
    { email: 'ishaani.kabir@tmds.com', firstName: 'Ishaani', lastName: 'Kabir' },
    { email: 'ayansh.arav@tmds.com', firstName: 'Ayansh', lastName: 'Arav' },
    { email: 'samaira.reyansh@tmds.com', firstName: 'Samaira', lastName: 'Reyansh' },
    { email: 'advay.vihaan@tmds.com', firstName: 'Advay', lastName: 'Vihaan' },
    { email: 'anviya.advik@tmds.com', firstName: 'Anviya', lastName: 'Advik' },
    { email: 'rishika.krish@tmds.com', firstName: 'Rishika', lastName: 'Krish' },
    { email: 'arjun.atharv@tmds.com', firstName: 'Arjun', lastName: 'Atharv' },
    { email: 'aadhya.rishaan@tmds.com', firstName: 'Aadhya', lastName: 'Rishaan' },
    { email: 'vihaan.vivaan@tmds.com', firstName: 'Vihaan', lastName: 'Vivaan' },
  ];

  const createdParticipants = [];
  for (const p of participants) {
    const participant = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: {
        email: p.email,
        password: participantPassword,
        firstName: p.firstName,
        lastName: p.lastName,
        role: 'PARTICIPANT',
      },
    });
    createdParticipants.push(participant);
  }

  // Create Additional Trainer
  const trainer2 = await prisma.user.upsert({
    where: { email: 'trainer2@tmds.com' },
    update: {},
    create: {
      email: 'trainer2@tmds.com',
      password: trainerPassword,
      firstName: 'Sarah',
      lastName: 'Williams',
      role: 'TRAINER',
    },
  });

  // Create Multiple Trainings - Spread across multiple months for calendar view
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Helper function to create date in current timezone
  const createDate = (month: number, day: number, hour: number = 9) => {
    return new Date(currentYear, month, day, hour, 0, 0);
  };

  const trainings = [
    // Past trainings (COMPLETED)
    {
      name: 'UI/UX Design Principles',
      description: 'Learn modern design principles, accessibility, and user experience best practices',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth - 1, 15, 9),
      endDate: createDate(currentMonth - 1, 15, 17),
      mode: 'OFFLINE',
      location: 'Design Studio, Building B',
      status: 'COMPLETED',
      maxParticipants: 20,
    },
    {
      name: 'Database Design & Optimization',
      description: 'Learn PostgreSQL, database design principles, and query optimization techniques',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth - 1, 20, 9),
      endDate: createDate(currentMonth - 1, 20, 17),
      mode: 'OFFLINE',
      location: 'Training Center, Floor 3',
      status: 'COMPLETED',
      maxParticipants: 25,
    },
    {
      name: 'JavaScript Fundamentals',
      description: 'Master JavaScript basics, ES6+ features, and modern programming patterns',
      trainerId: trainer.id,
      startDate: createDate(currentMonth - 1, 25, 9),
      endDate: createDate(currentMonth - 1, 25, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/js-fundamentals',
      status: 'COMPLETED',
      maxParticipants: 45,
    },
    
    // Current month trainings
    {
      name: 'Advanced React Development',
      description: 'Learn advanced React patterns, hooks, and best practices for building scalable applications',
      trainerId: trainer.id,
      startDate: createDate(currentMonth, 1, 9),
      endDate: createDate(currentMonth, 1, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/react-advanced-2025',
      status: 'COMPLETED',
      maxParticipants: 50,
    },
    {
      name: 'DevOps & CI/CD Pipeline',
      description: 'Introduction to Docker, Kubernetes, and setting up continuous integration pipelines',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth, 5, 9),
      endDate: createDate(currentMonth, 5, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/devops-2025',
      status: 'IN_PROGRESS',
      maxParticipants: 40,
    },
    {
      name: 'Python for Data Science',
      description: 'Learn Python programming, pandas, numpy, and data analysis techniques',
      trainerId: trainer.id,
      startDate: createDate(currentMonth, 8, 9),
      endDate: createDate(currentMonth, 8, 17),
      mode: 'HYBRID',
      location: 'Lab Room 2',
      meetingLink: 'https://meet.google.com/python-datascience',
      status: 'IN_PROGRESS',
      maxParticipants: 35,
    },
    {
      name: 'Node.js Backend Development',
      description: 'Master Node.js, Express, and building RESTful APIs with best practices',
      trainerId: trainer.id,
      startDate: createDate(currentMonth, 12, 9),
      endDate: createDate(currentMonth, 12, 17),
      mode: 'HYBRID',
      location: 'Conference Room A',
      meetingLink: 'https://meet.google.com/nodejs-2025',
      status: 'SCHEDULED',
      maxParticipants: 30,
    },
    {
      name: 'Cloud Architecture & AWS',
      description: 'Understanding cloud computing, AWS services, and architecture patterns',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth, 15, 9),
      endDate: createDate(currentMonth, 15, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/aws-cloud',
      status: 'SCHEDULED',
      maxParticipants: 50,
    },
    {
      name: 'TypeScript Fundamentals',
      description: 'Deep dive into TypeScript, type safety, and modern JavaScript features',
      trainerId: trainer.id,
      startDate: createDate(currentMonth, 18, 9),
      endDate: createDate(currentMonth, 18, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/typescript-2025',
      status: 'SCHEDULED',
      maxParticipants: 35,
    },
    {
      name: 'Agile & Scrum Methodology',
      description: 'Learn Agile principles, Scrum framework, and sprint planning techniques',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth, 22, 9),
      endDate: createDate(currentMonth, 22, 17),
      mode: 'OFFLINE',
      location: 'Conference Room B',
      status: 'SCHEDULED',
      maxParticipants: 25,
    },
    {
      name: 'Machine Learning Basics',
      description: 'Introduction to ML concepts, algorithms, and practical applications',
      trainerId: trainer.id,
      startDate: createDate(currentMonth, 25, 9),
      endDate: createDate(currentMonth, 25, 17),
      mode: 'HYBRID',
      location: 'AI Lab',
      meetingLink: 'https://meet.google.com/ml-basics',
      status: 'SCHEDULED',
      maxParticipants: 30,
    },
    {
      name: 'GraphQL API Development',
      description: 'Build efficient APIs with GraphQL, Apollo, and best practices',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth, 28, 9),
      endDate: createDate(currentMonth, 28, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/graphql-api',
      status: 'SCHEDULED',
      maxParticipants: 40,
    },
    
    // Next month trainings
    {
      name: 'Microservices Architecture',
      description: 'Design and implement microservices, service communication, and deployment',
      trainerId: trainer.id,
      startDate: createDate(currentMonth + 1, 2, 9),
      endDate: createDate(currentMonth + 1, 2, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/microservices',
      status: 'SCHEDULED',
      maxParticipants: 45,
    },
    {
      name: 'Security Best Practices',
      description: 'Learn application security, OWASP top 10, and secure coding practices',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth + 1, 5, 9),
      endDate: createDate(currentMonth + 1, 5, 17),
      mode: 'HYBRID',
      location: 'Security Lab',
      meetingLink: 'https://meet.google.com/security-best-practices',
      status: 'SCHEDULED',
      maxParticipants: 30,
    },
    {
      name: 'Mobile App Development',
      description: 'Build cross-platform mobile apps with React Native and Flutter',
      trainerId: trainer.id,
      startDate: createDate(currentMonth + 1, 8, 9),
      endDate: createDate(currentMonth + 1, 8, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/mobile-dev',
      status: 'SCHEDULED',
      maxParticipants: 40,
    },
    {
      name: 'Performance Optimization',
      description: 'Optimize application performance, caching strategies, and monitoring',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth + 1, 12, 9),
      endDate: createDate(currentMonth + 1, 12, 17),
      mode: 'OFFLINE',
      location: 'Performance Lab',
      status: 'SCHEDULED',
      maxParticipants: 25,
    },
    {
      name: 'Blockchain Fundamentals',
      description: 'Introduction to blockchain technology, smart contracts, and cryptocurrencies',
      trainerId: trainer.id,
      startDate: createDate(currentMonth + 1, 15, 9),
      endDate: createDate(currentMonth + 1, 15, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/blockchain',
      status: 'SCHEDULED',
      maxParticipants: 35,
    },
    {
      name: 'Docker & Containerization',
      description: 'Master Docker, container orchestration, and deployment strategies',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth + 1, 18, 9),
      endDate: createDate(currentMonth + 1, 18, 17),
      mode: 'HYBRID',
      location: 'DevOps Lab',
      meetingLink: 'https://meet.google.com/docker-containers',
      status: 'SCHEDULED',
      maxParticipants: 30,
    },
    {
      name: 'RESTful API Design',
      description: 'Design robust REST APIs, versioning, documentation, and testing',
      trainerId: trainer.id,
      startDate: createDate(currentMonth + 1, 22, 9),
      endDate: createDate(currentMonth + 1, 22, 17),
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/rest-api-design',
      status: 'SCHEDULED',
      maxParticipants: 40,
    },
    {
      name: 'Testing & Quality Assurance',
      description: 'Unit testing, integration testing, E2E testing, and QA best practices',
      trainerId: trainer2.id,
      startDate: createDate(currentMonth + 1, 25, 9),
      endDate: createDate(currentMonth + 1, 25, 17),
      mode: 'OFFLINE',
      location: 'QA Lab',
      status: 'SCHEDULED',
      maxParticipants: 28,
    },
  ];

  const createdTrainings = [];
  for (const t of trainings) {
    const training = await prisma.training.create({
      data: {
        name: t.name,
        description: t.description,
        trainerId: t.trainerId,
        createdById: admin.id,
        startDate: t.startDate,
        endDate: t.endDate,
        mode: t.mode as any,
        status: t.status as any,
        maxParticipants: t.maxParticipants,
        location: t.location,
        meetingLink: t.meetingLink,
      },
    });
    createdTrainings.push(training);
  }

  // Enroll participants in trainings (random distribution)
  const enrollments = [];
  for (let i = 0; i < createdTrainings.length; i++) {
    const training = createdTrainings[i];
    // Each training gets 5-12 random participants
    const numParticipants = Math.floor(Math.random() * 8) + 5;
    const shuffled = [...createdParticipants].sort(() => 0.5 - Math.random());
    const selectedParticipants = shuffled.slice(0, Math.min(numParticipants, createdParticipants.length));

    for (const participant of selectedParticipants) {
      enrollments.push({
        trainingId: training.id,
        userId: participant.id,
        status: training.status === 'COMPLETED' ? 'COMPLETED' : 'ENROLLED',
        enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        ...(training.status === 'COMPLETED' && {
          completedAt: new Date(training.endDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        }),
      });
    }
  }

  await prisma.enrollment.createMany({
    data: enrollments,
    skipDuplicates: true,
  });

  // Add attendance records for completed and in-progress trainings
  const attendanceRecords = [];
  for (const training of createdTrainings.filter(t => t.status === 'COMPLETED' || t.status === 'IN_PROGRESS')) {
    const trainingEnrollments = enrollments.filter(e => e.trainingId === training.id);
    for (const enrollment of trainingEnrollments) {
      // 80% attendance rate
      if (Math.random() > 0.2) {
        attendanceRecords.push({
          trainingId: training.id,
          userId: enrollment.userId,
          status: Math.random() > 0.1 ? 'PRESENT' : 'LATE',
          checkInTime: new Date(training.startDate.getTime() + Math.random() * 60 * 60 * 1000), // Within first hour
        });
      }
    }
  }

  await prisma.attendance.createMany({
    data: attendanceRecords,
    skipDuplicates: true,
  });

  // Add feedback for completed trainings
  const feedbacks = [];
  for (const training of createdTrainings.filter(t => t.status === 'COMPLETED')) {
    const trainingEnrollments = enrollments.filter(e => e.trainingId === training.id && e.status === 'COMPLETED');
    for (const enrollment of trainingEnrollments) {
      // 70% feedback submission rate
      if (Math.random() > 0.3) {
        feedbacks.push({
          trainingId: training.id,
          userId: enrollment.userId,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: [
            'Great training session! Very informative.',
            'Excellent content and delivery.',
            'Learned a lot of practical skills.',
            'The trainer was very knowledgeable.',
            'Would recommend to others.',
            'Well-structured and easy to follow.',
          ][Math.floor(Math.random() * 6)],
          trainerRating: Math.floor(Math.random() * 2) + 4,
          trainerComment: [
            'Great trainer!',
            'Very clear explanations.',
            'Helpful and patient.',
          ][Math.floor(Math.random() * 3)],
          submittedAt: new Date(training.endDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within 7 days after training
        });
      }
    }
  }

  await prisma.feedback.createMany({
    data: feedbacks,
    skipDuplicates: true,
  });

  // Add legitimate materials to trainings with realistic content
  const materialTemplates: Record<string, any[]> = {
    'Advanced React Development': [
      {
        name: 'React Hooks Deep Dive - Pre-work',
        description: 'Comprehensive guide to React Hooks including useState, useEffect, useContext, and custom hooks. Includes code examples and best practices.',
        type: 'PRE_WORK',
        externalLink: 'https://react.dev/reference/react',
        isRequired: true,
      },
      {
        name: 'React Performance Optimization Guide',
        description: 'Learn about React.memo, useMemo, useCallback, and code splitting techniques for optimal performance.',
        type: 'PRE_WORK',
        externalLink: 'https://react.dev/learn/render-and-commit',
        isRequired: true,
      },
      {
        name: 'Training Presentation Slides',
        description: 'Complete slide deck covering advanced React patterns, state management, and architectural decisions.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/react-advanced-slides',
        isRequired: false,
      },
      {
        name: 'Code Examples Repository',
        description: 'GitHub repository with all code examples, exercises, and solutions from the training session.',
        type: 'POST_TRAINING',
        externalLink: 'https://github.com/tmds/react-advanced-examples',
        isRequired: false,
      },
    ],
    'Node.js Backend Development': [
      {
        name: 'Node.js Fundamentals - Reading Material',
        description: 'Introduction to Node.js, event loop, streams, and asynchronous programming concepts.',
        type: 'PRE_WORK',
        externalLink: 'https://nodejs.org/en/docs/guides',
        isRequired: true,
      },
      {
        name: 'Express.js Best Practices',
        description: 'Guide to building RESTful APIs with Express.js, middleware, error handling, and security.',
        type: 'PRE_WORK',
        externalLink: 'https://expressjs.com/en/guide/best-practices.html',
        isRequired: true,
      },
      {
        name: 'API Design Patterns PDF',
        description: 'Comprehensive guide to RESTful API design, versioning, authentication, and documentation standards.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/api-design-patterns',
        isRequired: false,
      },
      {
        name: 'Sample Project - E-commerce API',
        description: 'Complete Node.js/Express project demonstrating best practices for production applications.',
        type: 'POST_TRAINING',
        externalLink: 'https://github.com/tmds/nodejs-ecommerce-api',
        isRequired: false,
      },
    ],
    'Database Design & Optimization': [
      {
        name: 'SQL Fundamentals Cheat Sheet',
        description: 'Quick reference guide for SQL queries, joins, indexes, and common database operations.',
        type: 'PRE_WORK',
        externalLink: 'https://www.postgresql.org/docs/current/tutorial.html',
        isRequired: true,
      },
      {
        name: 'Database Normalization Guide',
        description: 'Understanding 1NF, 2NF, 3NF, and BCNF with practical examples and trade-offs.',
        type: 'PRE_WORK',
        externalLink: 'https://drive.google.com/file/db-normalization',
        isRequired: true,
      },
      {
        name: 'Query Optimization Techniques',
        description: 'Advanced techniques for optimizing PostgreSQL queries, indexing strategies, and performance tuning.',
        type: 'POST_TRAINING',
        externalLink: 'https://www.postgresql.org/docs/current/performance-tips.html',
        isRequired: false,
      },
      {
        name: 'Database Design Templates',
        description: 'ERD templates and database design patterns for common application scenarios.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/db-design-templates',
        isRequired: false,
      },
    ],
    'DevOps & CI/CD Pipeline': [
      {
        name: 'Docker Basics Tutorial',
        description: 'Introduction to Docker containers, images, Dockerfile, and container orchestration basics.',
        type: 'PRE_WORK',
        externalLink: 'https://docs.docker.com/get-started/',
        isRequired: true,
      },
      {
        name: 'CI/CD Concepts Overview',
        description: 'Understanding continuous integration, continuous deployment, and pipeline automation.',
        type: 'PRE_WORK',
        externalLink: 'https://www.atlassian.com/continuous-delivery/principles/continuous-integration-vs-delivery-vs-deployment',
        isRequired: true,
      },
      {
        name: 'Kubernetes Getting Started Guide',
        description: 'Complete guide to Kubernetes concepts, pods, services, deployments, and scaling.',
        type: 'POST_TRAINING',
        externalLink: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
        isRequired: false,
      },
      {
        name: 'GitHub Actions Workflow Examples',
        description: 'Collection of ready-to-use GitHub Actions workflows for CI/CD pipelines.',
        type: 'POST_TRAINING',
        externalLink: 'https://github.com/tmds/github-actions-examples',
        isRequired: false,
      },
    ],
    'TypeScript Fundamentals': [
      {
        name: 'TypeScript Handbook',
        description: 'Official TypeScript handbook covering types, interfaces, generics, and advanced features.',
        type: 'PRE_WORK',
        externalLink: 'https://www.typescriptlang.org/docs/handbook/intro.html',
        isRequired: true,
      },
      {
        name: 'TypeScript vs JavaScript Guide',
        description: 'Understanding the differences, benefits, and migration strategies from JavaScript to TypeScript.',
        type: 'PRE_WORK',
        externalLink: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html',
        isRequired: true,
      },
      {
        name: 'TypeScript Best Practices',
        description: 'Code examples and patterns for writing maintainable, type-safe TypeScript applications.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/typescript-best-practices',
        isRequired: false,
      },
      {
        name: 'TypeScript Project Template',
        description: 'Starter template with TypeScript, ESLint, Prettier, and testing setup configured.',
        type: 'POST_TRAINING',
        externalLink: 'https://github.com/tmds/typescript-starter',
        isRequired: false,
      },
    ],
    'UI/UX Design Principles': [
      {
        name: 'Design Thinking Process',
        description: 'Introduction to design thinking methodology, user research, and empathy mapping.',
        type: 'PRE_WORK',
        externalLink: 'https://www.interaction-design.org/literature/article/5-stages-in-the-design-thinking-process',
        isRequired: true,
      },
      {
        name: 'Accessibility Guidelines (WCAG)',
        description: 'Web Content Accessibility Guidelines for creating inclusive user experiences.',
        type: 'PRE_WORK',
        externalLink: 'https://www.w3.org/WAI/WCAG21/quickref/',
        isRequired: true,
      },
      {
        name: 'Design System Components Library',
        description: 'Reusable UI component library with design tokens, patterns, and usage guidelines.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/design-system-components',
        isRequired: false,
      },
      {
        name: 'User Research Templates',
        description: 'Templates for user interviews, surveys, personas, and usability testing.',
        type: 'POST_TRAINING',
        externalLink: 'https://drive.google.com/file/user-research-templates',
        isRequired: false,
      },
    ],
  };

  // Default materials for trainings not in template
  const defaultMaterials = [
    {
      name: 'Pre-work Reading Material',
      description: 'Essential reading materials and resources to prepare for the training session. Please review before attending.',
      type: 'PRE_WORK',
      externalLink: 'https://docs.google.com/document/prework',
      isRequired: true,
    },
    {
      name: 'Training Presentation Slides',
      description: 'Complete presentation slides covering all topics discussed during the training session.',
      type: 'POST_TRAINING',
      externalLink: 'https://drive.google.com/file/training-slides',
      isRequired: false,
    },
    {
      name: 'Additional Resources',
      description: 'Supplementary materials, articles, and documentation for further learning.',
      type: 'POST_TRAINING',
      externalLink: 'https://docs.google.com/document/additional-resources',
      isRequired: false,
    },
  ];

  const materials = [];
  for (const training of createdTrainings) {
    const trainingMaterials = materialTemplates[training.name] || defaultMaterials;
    
    for (const material of trainingMaterials) {
      const distributedAt = material.type === 'PRE_WORK' 
        ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        : (training.status === 'COMPLETED' || training.status === 'IN_PROGRESS')
          ? new Date(training.endDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)
          : null;

      materials.push({
        trainingId: training.id,
        name: material.name,
        description: material.description,
        type: material.type,
        externalLink: material.externalLink,
        isRequired: material.isRequired,
        ...(distributedAt && { distributedAt }),
      });
    }
  }

  await prisma.trainingMaterial.createMany({
    data: materials,
  });

  console.log('✅ Seeding completed!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Admin user`);
  console.log(`   - 2 Trainer users`);
  console.log(`   - ${createdParticipants.length} Participant users`);
  console.log(`   - ${createdTrainings.length} Training programs`);
  console.log(`   - ${enrollments.length} Enrollments`);
  console.log(`   - ${attendanceRecords.length} Attendance records`);
  console.log(`   - ${feedbacks.length} Feedback submissions`);
  console.log(`   - ${materials.length} Training materials`);
  console.log('\n📋 Default Credentials:');
  console.log('Admin: admin@tmds.com / admin123');
  console.log('Trainer: trainer@tmds.com / trainer123');
  console.log('Participant: participant@tmds.com / participant123');
  console.log('Trainer 2: trainer2@tmds.com / trainer123');
  console.log('Participants: 100 users with Indian names (all use password: participant123)');
  console.log('Sample: arjun.sharma@tmds.com, priya.patel@tmds.com, rahul.kumar@tmds.com, etc.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

