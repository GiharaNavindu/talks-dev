provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "my_ec2" {
  ami           = "ami-071226ecf16aa7d96"  # Free-tier Ubuntu AMI (us-east-1)
  instance_type = "t2.micro"
  key_name      = "chat-app-key"  # Change to your key pair name

  tags = {
    Name = "chat-app"
  }
}

