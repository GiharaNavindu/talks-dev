provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "chat_server" {
  ami                    = "ami-0c55b159cbfafe1f0" # Example Ubuntu AMI, change as needed
  instance_type          = "t2.micro"
  key_name               = "chat-app-key"
  vpc_security_group_ids = ["sg-12345678"] # Replace with actual security group
  tags = {
    Name = "ChatAppServer"
  }
}

output "instance_ip" {
  value = aws_instance.chat_server.public_ip
}
